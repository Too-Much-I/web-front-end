import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { ScoreReport } from "@/types/report";

export function useReport(attemptId: string) {
  return useQuery({
    queryKey: ["report", attemptId],
    queryFn: () => apiFetch<ScoreReport>(`/attempts/${attemptId}/report`),
    enabled: Boolean(attemptId),
  });
}
