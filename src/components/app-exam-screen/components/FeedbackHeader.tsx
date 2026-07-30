import { feedbackColors } from "@/components/app-exam-screen/theme";

type FeedbackHeaderProps = {
  currentStep: number;
  totalSteps: number;
};

export function FeedbackHeader({
  currentStep,
  totalSteps,
}: FeedbackHeaderProps) {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <header className="sticky top-0 z-20 bg-[#fff9f2]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="pt-3 pb-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm" style={{ color: feedbackColors.positive }}>
            SESSION ANALYSIS
          </p>
          <p className="text-sm text-zinc-500" aria-hidden>
            {currentStep} / {totalSteps}
          </p>
        </div>

        <div
          role="progressbar"
          aria-label={`피드백 확인 진행률 ${currentStep}/${totalSteps}`}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100"
        >
          <div
            className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: feedbackColors.brand,
            }}
          />
        </div>
      </div>
    </header>
  );
}
