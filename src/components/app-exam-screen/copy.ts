/**
 * 종합 피드백 복구 안내 문구.
 *
 * 같은 상황을 바(`SummaryFeedbackRecoveryBar`)와 다이얼로그
 * (`SummaryFeedbackRecoveryDialog`) 두 곳에서 알리기 때문에 문구를 각자
 * 하드코딩하면 한쪽만 고쳐 서로 다른 말을 하게 된다.
 */
export const summaryFeedbackRecoveryCopy = {
  /**
   * 구버전 앱이라 재생성 요청을 보낼 브릿지 메시지가 없는 경우.
   * "앱을 업데이트하면 된다"고 약속하지 않는다 — 업데이트 배포 시점을
   * 이 화면이 알 수 없어서, 현재 지원 여부만 알린다.
   */
  retryUnsupported: "현재 앱 버전에서는 종합 피드백 재생성을 지원하지 않아요.",
} as const;
