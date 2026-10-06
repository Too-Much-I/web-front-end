import { describe, expect, it } from "vitest";

import { resolveAppUpdateStores } from "@/lib/app-update-stores";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/site-config";

describe("resolveAppUpdateStores", () => {
  it.each([
    ["ios", APP_STORE_URL],
    ["android", PLAY_STORE_URL],
    ["ios", APP_STORE_URL.replace("/kr/", "/us/")],
    ["android", `${PLAY_STORE_URL}&hl=ko`],
  ])("shows the matching official %s store", (platform, storeUrl) => {
    expect(resolveAppUpdateStores({ platform, storeUrl }, true)).toEqual([
      expect.objectContaining({ platform, href: storeUrl }),
    ]);
  });

  it("does not trust browser-only capabilities", () => {
    expect(
      resolveAppUpdateStores(
        { platform: "ios", storeUrl: APP_STORE_URL },
        false,
      ),
    ).toHaveLength(2);
  });

  it.each([
    undefined,
    {},
    { platform: "ios" },
    { storeUrl: APP_STORE_URL },
    { platform: "windows", storeUrl: APP_STORE_URL },
    { platform: "ios", storeUrl: PLAY_STORE_URL },
    { platform: "android", storeUrl: APP_STORE_URL },
    { platform: "ios", storeUrl: "javascript:alert(1)" },
    { platform: "ios", storeUrl: APP_STORE_URL.replace("https:", "http:") },
    {
      platform: "ios",
      storeUrl: APP_STORE_URL.replace(
        "apps.apple.com",
        "apps.apple.com.evil.test",
      ),
    },
    {
      platform: "ios",
      storeUrl: APP_STORE_URL.replace("6803419955", "123456789"),
    },
    {
      platform: "ios",
      storeUrl: APP_STORE_URL.replace("https://", "https://user:password@"),
    },
    {
      platform: "android",
      storeUrl: PLAY_STORE_URL.replace(
        "com.toteacher.app",
        "com.toteacher.app.other",
      ),
    },
    { platform: "android", storeUrl: `${PLAY_STORE_URL}&id=other.app` },
    {
      platform: "android",
      storeUrl: PLAY_STORE_URL.replace("/details", "/search"),
    },
  ])(
    "falls back to both stores for incomplete or invalid capabilities: %j",
    (capabilities) => {
      expect(
        resolveAppUpdateStores(capabilities, true).map(({ href }) => href),
      ).toEqual([APP_STORE_URL, PLAY_STORE_URL]);
    },
  );
});
