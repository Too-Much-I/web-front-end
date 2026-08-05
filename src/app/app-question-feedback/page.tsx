"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { QuestionFeedbackScreen } from "@/components/app-question-feedback/QuestionFeedbackScreen";
import { ErrorFallbackScreen } from "@/components/error-fallback-screen";
import { getExamQuestionFeedback } from "@/features/exam/api/exam-question-feedback";
import {
  MOCK_QUESTION_NUMBERS,
  getMockQuestionFeedback,
} from "@/features/exam/mock-question-retry-feedback";
import { postToNative } from "@/lib/native-bridge";

/**
 * 앱 웹뷰에 "실제 화면을 그릴 데이터가 준비됐다"고 알린다.
 * 네이티브는 이 메시지를 받을 때까지 자체 스켈레톤을 유지한다 —
 * WebView의 문서 로드 완료(renderLoading)는 데이터 로딩 완료와 시점이 다르다.
 */
type FeedbackDataReadyMessage = {
  type: "FEEDBACK_DATA_READY";
};

function parseRetryCount(raw: string | null): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function AppQuestionFeedbackContent() {
  const searchParams = useSearchParams();
  /**
   * ?mock=1이면 서버 대신 픽스처를 쓴다.
   * 회차 그래프와 지표 증감을 서버 없이 확인하기 위한 경로다.
   * 실 조회 경로는 그대로 두고 이 플래그로만 가른다.
   */
  const isMock = searchParams.get("mock") === "1";
  const examId = searchParams.get("examId") ?? (isMock ? "mock_exam_001" : "");
  const questionNumber = Number(searchParams.get("questionNumber"));

  /**
   * 회차는 URL만을 단일 소스로 쓴다 — 로컬 state로 복사해 두면 URL과 어긋날 수 있고,
   * 그걸 다시 맞추는 코드가 필요해진다.
   *
   * 회차 칩은 router.replace가 아니라 history.replaceState로 URL을 바꾼다.
   * App Router의 router.push/replace는 서버 왕복이 생기지만, 네이티브 History API는
   * Next가 가로채서 usePathname/useSearchParams만 갱신해 준다(next/dist/client/
   * components/app-router.js의 replaceState 패치 참고). 그래서 재로드 없이 이 훅이
   * 새 값으로 리렌더된다.
   *
   * push가 아니라 replace인 이유: 회차를 옮길 때마다 history가 쌓이면 앱의 뒤로가기가
   * 화면을 벗어나지 못하고 회차만 되짚는다. 이 화면의 뒤로가기는 덱 이동에 쓰려고
   * QUESTION_FEEDBACK_NAVIGATION_STATE로 앱과 따로 맞추고 있다.
   */
  const retryCount = parseRetryCount(searchParams.get("retryCount"));

  function selectRetry(next: number) {
    const url = new URL(window.location.href);
    url.searchParams.set("retryCount", String(next));
    window.history.replaceState(null, "", url);
  }

  // questionNumber가 없으면 searchParams.get()이 null을 주고 Number(null)은 0이라
  // isInteger만으로는 통과해 버린다 — 0번 문제를 조회하러 가지 않도록 양수까지 확인한다.
  const hasValidParams =
    Boolean(examId) && Number.isInteger(questionNumber) && questionNumber > 0;

  const {
    data: detail,
    error,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "exam-question-feedback",
      examId,
      questionNumber,
      retryCount,
      isMock,
    ],
    queryFn: async () =>
      isMock
        ? getMockQuestionFeedback(examId, questionNumber, retryCount)
        : getExamQuestionFeedback(examId, questionNumber, retryCount),
    enabled: hasValidParams,
    // 채점이 끝난 회차의 결과는 바뀌지 않는다 — 회차를 오가도 재요청하지 않는다.
    staleTime: Infinity,
    gcTime: Infinity,
    // 회차를 바꾸는 동안 화면이 빈 상태로 깜빡이지 않도록 이전 회차를 그대로 두고 덮어쓴다.
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!detail) return;
    const message: FeedbackDataReadyMessage = { type: "FEEDBACK_DATA_READY" };
    postToNative(message);
  }, [detail]);

  if (!hasValidParams) {
    return (
      <p className="flex min-h-dvh items-center justify-center px-6 text-center text-sm leading-relaxed text-zinc-500">
        잘못된 접근이에요. examId와 questionNumber(1 이상)가 필요해요.
        <br />
        서버 없이 화면만 보려면 ?mock=1&amp;questionNumber=
        {MOCK_QUESTION_NUMBERS.join("/")} 로 열어 주세요.
      </p>
    );
  }

  if (error) {
    return (
      <ErrorFallbackScreen
        description="문제별 피드백을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
        onRetry={() => void refetch()}
      />
    );
  }

  if (isPending || !detail) {
    return (
      <p className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">
        불러오는 중이에요...
      </p>
    );
  }

  return (
    <QuestionFeedbackScreen
      detail={detail}
      isFetching={isFetching}
      onSelectRetry={selectRetry}
    />
  );
}

export default function AppQuestionFeedbackPage() {
  return (
    <Suspense fallback={null}>
      <AppQuestionFeedbackContent />
    </Suspense>
  );
}
