"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * GA4로 보내는 커스텀 이벤트 이름 목록. GA4는 이벤트 이름의 오타/표기 차이를 전부 별개
 * 이벤트로 집계하고 한번 쌓인 데이터는 소급 수정할 수 없으므로, 새 이벤트는 반드시
 * 여기에 추가한 뒤 사용한다 (snake_case, `대상_동작` 순서).
 *
 * 이벤트 파라미터는 GA4 표준 보고서에 노출되려면 GA4 관리 콘솔의 "맞춤 정의(Custom
 * definitions)"에 같은 이름으로 등록되어야 한다. 현재 사용 중인 파라미터:
 * exam_mode("trial"|"full"), target_grade(등급 id), part, question_number,
 * last_question_number, satisfaction, retry_count, grading_type
 */
export type AnalyticsEventName =
  | "target_grade_select"
  | "consent_complete"
  | "mic_test_complete"
  | "sound_check_complete"
  | "exam_start"
  | "question_complete"
  | "exam_complete"
  | "exam_terminate"
  | "exam_exit"
  | "grading_fail"
  | "reanswer_submit"
  | "survey_submit";

export function trackEvent(
  name: AnalyticsEventName,
  params?: Record<string, string | number>,
): void {
  // 측정 ID가 없으면 GoogleAnalyticsTag가 마운트되지 않아 gtag도 없다 — 콘솔 경고만 남으므로 조용히 무시.
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
  sendGAEvent("event", name, params ?? {});
}
