"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ExamSessionScreen } from "@/components/exam/exam-session-screen";
import { createExamSession } from "@/features/exam/api/exam-session-create";
import { createTrialExamSession } from "@/features/exam/api/exam-trial-session-create";
import { addStoredMyExamId } from "@/features/exam/my-exam-ids";
import type { ExamSession } from "@/types/exam";

function ExamSessionContent() {
  const searchParams = useSearchParams();
  const isTrial = searchParams.get("mode") === "trial";

  const [session, setSession] = useState<ExamSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    // 💡 화면이 켜지자마자 백엔드로 세션 생성(POST /api/v1/exams 또는 /api/v1/exam/trial)을 요청합니다!
    // StrictMode에서 effect가 두 번 실행돼도 세션이 중복 생성되지 않도록 가드합니다.
    if (requestedRef.current) return;
    requestedRef.current = true;

    (isTrial ? createTrialExamSession() : createExamSession())
      .then((realSession) => {
        // 결과 리포트에서 "내가 응시한 시험"인지 판별할 수 있도록 기록해 둔다.
        // (리포트 링크를 공유받은 사람에게 설문 CTA 등을 숨기는 용도)
        addStoredMyExamId(realSession.examId);
        setSession(realSession);
      })
      .catch((err) => {
        console.error("시험 생성 API 호출 에러:", err);
        setError("백엔드 서버에서 모의고사를 불러오는 데 실패했습니다.");
      });
  }, [isTrial]);

  // API 응답을 기다리는 동안 보여줄 화면
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
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
