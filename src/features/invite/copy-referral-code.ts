/**
 * 추천 코드를 클립보드에 복사한다. 성공하면 true.
 *
 * 클릭 핸들러 안에서 바로 불러야 브라우저가 클립보드 쓰기를 허용한다. 일부 인앱 브라우저는
 * 그래도 거절하므로, 실패하면 호출한 쪽이 코드 텍스트를 선택해 길게 눌러 복사하도록 안내한다.
 */
export async function copyReferralCode(code: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch {
    return false;
  }
}
