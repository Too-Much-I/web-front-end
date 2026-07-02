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

/** 발급받은 presigned URL로 녹음 파일을 S3에 직접 업로드한다. */
async function putAnswerAudioToS3(uploadUrl: string, audioBlob: Blob): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": audioBlob.type || "audio/wav" },
    body: audioBlob,
  });

  if (!res.ok) {
    throw new Error(`S3 업로드에 실패했습니다. (status: ${res.status})`);
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

/**
 * 녹음이 끝난 답변 오디오를 업로드하고 AI 채점을 요청하는 전체 흐름.
 * 1) presigned URL 발급 → 2) S3에 PUT 업로드 → 3) 업로드 완료 알림 + 채점 요청
 */
export async function uploadExamAnswer(
  examId: string,
  questionId: string,
  audioBlob: Blob,
): Promise<ExamAnswerSubmitResult> {
  const { uploadUrl, fileKey } = await getAnswerUploadUrl(examId, questionId);
  await putAnswerAudioToS3(uploadUrl, audioBlob);
  return submitAnswerForGrading(examId, questionId, fileKey);
}
