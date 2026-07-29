/**
 * 목록을 불러오지 못했을 때 보여주는 상태.
 *
 * 목록 페이지는 ISR로 프리렌더되므로, 백엔드가 응답하지 않을 때 예외를 그대로
 * 던지면 빌드가 실패하고 배포된 뒤에는 500이 뜬다. 대신 이 안내를 렌더링해
 * 다음 재검증 때 자연스럽게 복구되도록 한다.
 */
export function BlogListUnavailable() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
      <p className="font-bold text-blue-950">글을 불러오지 못했어요.</p>
      <p className="text-sm text-zinc-500">
        일시적인 문제일 수 있어요. 잠시 후 다시 확인해 주세요.
      </p>
    </div>
  );
}
