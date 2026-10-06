import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api/client";
import {
  isNativeDataRequestAvailable,
  requestFromNative,
} from "@/lib/native-data-bridge";
import { createAppExamSummary, getAppExamSummary } from "./exam-grading-result";

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }));
vi.mock("@/lib/native-data-bridge", () => ({
  isNativeDataRequestAvailable: vi.fn(),
  requestFromNative: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

describe("summary update requirement", () => {
  it("accepts an update-only result before reading feedback fields", () => {
    const raw = {
      appUpdateRequired: true,
      get totalScore() {
        throw new Error("must not map feedback");
      },
    };
    expect(createAppExamSummary(raw, "exam-1")).toEqual({
      appUpdateRequired: true,
      dataSource: "native-bridge",
    });
  });

  it.each([false, undefined, null, "true", 1, {}])(
    "preserves feedback mapping for %j",
    (flag) => {
      const baseline = createAppExamSummary({}, "exam-1");
      expect(
        createAppExamSummary({ appUpdateRequired: flag }, "exam-1"),
      ).toEqual(baseline);
      expect(baseline.appUpdateRequired).toBe(false);
    },
  );

  it("unwraps the direct API envelope", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      result: { appUpdateRequired: true },
    });
    expect(await getAppExamSummary("exam-1")).toEqual({
      appUpdateRequired: true,
      dataSource: "direct-api",
    });
  });

  it("accepts the native bridge's already-unwrapped result", async () => {
    vi.mocked(isNativeDataRequestAvailable).mockReturnValue(true);
    vi.mocked(requestFromNative).mockResolvedValue({ appUpdateRequired: true });
    expect(await getAppExamSummary("exam-1")).toEqual({
      appUpdateRequired: true,
      dataSource: "native-bridge",
    });
    expect(apiFetch).not.toHaveBeenCalled();
  });
});
