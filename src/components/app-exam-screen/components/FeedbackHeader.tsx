import { feedbackColors } from "@/components/app-exam-screen/theme";

export function FeedbackHeader() {
  return (
    <header className="pt-3 pb-5">
      <p className="text-sm" style={{ color: feedbackColors.positive }}>
        SESSION ANALYSIS
      </p>
      <h1 className="mt-1 text-3xl text-blue-950">종합 결과 분석</h1>
      <p className="mt-2 text-sm text-zinc-500">
        오늘의 답변을 한 화면에서 차근차근 확인해보세요.
      </p>
    </header>
  );
}
