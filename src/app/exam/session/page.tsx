"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ErrorFallbackScreen } from "@/components/error-fallback-screen";
import { ExamSessionScreen } from "@/components/exam/exam-session-screen";
import { createExamSession } from "@/features/exam/api/exam-session-create";
import { createTrialExamSession } from "@/features/exam/api/exam-trial-session-create";
import { findUnpresentableQuestions } from "@/features/exam/exam-session-readiness";
import { addStoredMyExamId } from "@/features/exam/my-exam-ids";
import { reportExamSessionBlocked } from "@/features/exam/report-exam-session-blocked";
import type { ExamSession } from "@/types/exam";

interface SessionStartError {
  title: string;
  description: string;
}

const SERVER_ERROR: SessionStartError = {
  title: "모의고사를 불러오지 못했어요",
  description:
    "서버에서 문제를 받아오는 데 실패했어요. 잠시 후 다시 시도해 주세요.",
};

/**
 * 문제를 띄울 수 없어 시작 자체를 막은 경우.
 *
 * "응시권이 차감되지 않는다"고 단정하지 않는다 — 세션 생성 요청은 이미 서버로 나갔고,
 * 회차 소진 여부는 백엔드 정책이다. 화면에서 약속할 수 있는 사실은 "시험이 시작되지
 * 않았다"까지다. (docs/exam-table-contract-failure-policy.md)
 */
const UNPRESENTABLE_ERROR: SessionStartError = {
  title: "시험을 시작할 수 없어요",
  description:
    "문제 데이터가 올바르지 않아 시험을 시작하지 못했어요. 답변은 진행되지 않았으니 잠시 후 다시 시도해 주세요.",
};

function ExamSessionContent() {
  const searchParams = useSearchParams();
  const isTrial = searchParams.get("mode") === "trial";

  const [session, setSession] = useState<ExamSession | null>(null);
  const [error, setError] = useState<SessionStartError | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    // 💡 화면이 켜지자마자 백엔드로 세션 생성(POST /api/v1/exams 또는 /api/v1/exam/trial)을 요청합니다!
    // StrictMode에서 effect가 두 번 실행돼도 세션이 중복 생성되지 않도록 가드합니다.
    if (requestedRef.current) return;
    requestedRef.current = true;

    (isTrial ? createTrialExamSession() : createExamSession())
      .then((realSession) => {
        // 답할 수 없는 문제가 섞여 있으면 시험을 시작하지 않는다. 시작해 버리면
        // 응시자는 그 문제를 못 푼 채로 회차만 쓰게 된다.
        const unpresentable = findUnpresentableQuestions(realSession);
        if (unpresentable.length > 0) {
          reportExamSessionBlocked(unpresentable);
          setError(UNPRESENTABLE_ERROR);
          return;
        }

        // 결과 리포트에서 "내가 응시한 시험"인지 판별할 수 있도록 기록해 둔다.
        // (리포트 링크를 공유받은 사람에게 설문 CTA 등을 숨기는 용도)
        addStoredMyExamId(realSession.examId);
        setSession(realSession);
      })
      .catch((err) => {
        console.error("시험 생성 API 호출 에러:", err);
        setError(SERVER_ERROR);
      });
  }, [isTrial]);

  // API 응답을 기다리는 동안 보여줄 화면
  if (error)
    return (
      <div className="flex min-h-screen flex-col">
        <ErrorFallbackScreen
          title={error.title}
          description={error.description}
        />
      </div>
    );
  if (!session)
    return (
      <div className="flex h-screen items-center justify-center text-zinc-500">
        백엔드 서버와 연결 중입니다...
      </div>
    );

  // 실제 데이터가 도착하면 시험 화면 렌더링
  return <ExamSessionScreen session={session} isTrial={isTrial} />;
}

export default function ExamSessionPage() {
  return (
    <Suspense fallback={null}>
      <ExamSessionContent />
    </Suspense>
  );
}
