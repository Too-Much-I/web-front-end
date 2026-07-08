"use client";

import { useEffect, useRef, useState } from "react";
import { ExamSessionScreen } from "@/components/exam/exam-session-screen";
import { createExamSession } from "@/features/exam/api/exam-session-create";
import type { ExamSession } from "@/types/exam";

export default function ExamSessionPage() {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    // 💡 화면이 켜지자마자 백엔드로 세션 생성(POST /api/v1/exams)을 요청합니다!
    // StrictMode에서 effect가 두 번 실행돼도 세션이 중복 생성되지 않도록 가드합니다.
    if (requestedRef.current) return;
    requestedRef.current = true;

    createExamSession()
      .then((realSession) => {
        setSession(realSession);
      })
      .catch((err) => {
        console.error("시험 생성 API 호출 에러:", err);
        setError("백엔드 서버에서 모의고사를 불러오는 데 실패했습니다.");
      });
  }, []);

  // API 응답을 기다리는 동안 보여줄 화면
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  if (!session) return <div className="flex h-screen items-center justify-center text-zinc-500">백엔드 서버와 연결 중입니다...</div>;

  // 실제 데이터가 도착하면 시험 화면 렌더링
  return <ExamSessionScreen session={session} />;
}
