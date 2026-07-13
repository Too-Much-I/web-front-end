import { apiFetch } from "@/lib/api/client";
import type { ExamAnswerSubmitResult, ExamAnswerUploadUrl } from "@/types/exam";

interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

/** S3 presigned upload URL을 발급받는다. */
async function getAnswerUploadUrl(
  examId: string,
  questionId: string,
): Promise<ExamAnswerUploadUrl> {
  const { result } = await apiFetch<ApiEnvelope<ExamAnswerUploadUrl>>(
    `/api/v1/exams/${examId}/questions/${questionId}/upload-url`,
  );
  return result;
}

/** 한 번의 PUT 시도가 무한 대기하지 않도록 거는 타임아웃(ms). */
const PUT_TIMEOUT_MS = 15_000;

/** 발급받은 presigned URL로 녹음 파일을 S3에 직접 업로드한다. */
async function putAnswerAudioToS3(uploadUrl: string, audioBlob: Blob): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PUT_TIMEOUT_MS);

  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": audioBlob.type || "audio/wav" },
      body: audioBlob,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`S3 업로드에 실패했습니다. (status: ${res.status})`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/** S3 업로드 완료를 서버에 알리고 AI 채점을 요청한다. */
async function submitAnswerForGrading(
  examId: string,
  questionId: string,
  fileKey: string,
): Promise<ExamAnswerSubmitResult> {
  const { result } = await apiFetch<ApiEnvelope<ExamAnswerSubmitResult>>(
    `/api/v1/exams/${examId}/questions/${questionId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ fileKey }),
    },
  );
  return result;
}

/** 재시도 사이 대기 시간(ms). 1s → 2s → 4s → 8s → 16s, 총 5회 재시도(최대 6번 시도). */
const UPLOAD_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * S3 PUT 업로드를 지수 백오프로 재시도한다. presigned URL은 재발급받지 않고 재사용하므로,
 * 서버가 응답한 실제 만료 시각(deadline)을 넘기면 재시도 횟수가 남아있어도 즉시 포기한다
 * (만료된 URL로는 S3가 어차피 거부하기 때문).
 */
async function putAnswerAudioToS3WithRetry(
  uploadUrl: string,
  audioBlob: Blob,
  deadline: number,
): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    if (Date.now() >= deadline) {
      throw new Error("presigned URL이 만료되어 S3 업로드를 재시도할 수 없습니다.");
    }

    try {
      return await putAnswerAudioToS3(uploadUrl, audioBlob);
    } catch (err) {
      if (attempt >= UPLOAD_RETRY_DELAYS_MS.length) throw err;

      const delay = UPLOAD_RETRY_DELAYS_MS[attempt];
      if (Date.now() + delay >= deadline) throw err;

      await wait(delay);
    }
  }
}

/**
 * 녹음이 끝난 답변 오디오를 업로드하고 AI 채점을 요청하는 전체 흐름.
 * 1) presigned URL 발급 → 2) S3에 PUT 업로드(실패 시 지수 백오프로 재시도) → 3) 업로드 완료 알림 + 채점 요청
 *
 * 호출부가 이 Promise를 기다리지 않는 fire-and-forget 방식이라 재시도 타이머는
 * React 라이프사이클과 무관하게 끝까지 진행된다.
 */
export async function uploadExamAnswer(
  examId: string,
  questionId: string,
  audioBlob: Blob,
): Promise<ExamAnswerSubmitResult> {
  const { uploadUrl, fileKey, expiresIn } = await getAnswerUploadUrl(examId, questionId);
  const deadline = Date.now() + expiresIn * 1000;
  await putAnswerAudioToS3WithRetry(uploadUrl, audioBlob, deadline);
  return submitAnswerForGrading(examId, questionId, fileKey);
}
