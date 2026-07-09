interface RateLimiterOptions {
  /** 요청을 세는 슬라이딩 윈도우 길이 (ms). */
  windowMs: number;
  /** 윈도우 내 허용 요청 수. 초과 시 차단. */
  maxRequests: number;
  /** 만료된 IP 키를 정리하는 주기 (ms). 기본값은 windowMs의 10배. */
  sweepIntervalMs?: number;
}

/**
 * IP당 요청 수를 제한하는 인메모리 슬라이딩 윈도우 레이트리미터.
 * 단일 인스턴스 기준 (PoC 배포 범위 한정 — 다중 인스턴스 환경에서는 공유 스토어로 교체 필요).
 * 활성 요청이 없어진 IP 키는 주기적으로 정리해 Map이 무한정 커지는 것을 막는다.
 */
export function createIpRateLimiter({
  windowMs,
  maxRequests,
  sweepIntervalMs = windowMs * 10,
}: RateLimiterOptions) {
  const requestTimestampsByIp = new Map<string, number[]>();
  let lastSweepAt = Date.now();

  function sweepStaleEntries(now: number) {
    if (now - lastSweepAt < sweepIntervalMs) return;
    lastSweepAt = now;
    for (const [ip, timestamps] of requestTimestampsByIp) {
      const stillActive = timestamps.some((timestamp) => now - timestamp < windowMs);
      if (!stillActive) requestTimestampsByIp.delete(ip);
    }
  }

  return {
    isRateLimited(ip: string): boolean {
      const now = Date.now();
      sweepStaleEntries(now);

      const recent = (requestTimestampsByIp.get(ip) ?? []).filter(
        (timestamp) => now - timestamp < windowMs,
      );
      recent.push(now);
      requestTimestampsByIp.set(ip, recent);
      return recent.length > maxRequests;
    },
  };
}
