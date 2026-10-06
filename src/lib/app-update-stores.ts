import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/site-config";

type UpdateStore = {
  platform: "ios" | "android";
  label: string;
  href: string;
};

const stores: readonly UpdateStore[] = [
  { platform: "ios", label: "App Store에서 업데이트", href: APP_STORE_URL },
  {
    platform: "android",
    label: "Google Play에서 업데이트",
    href: PLAY_STORE_URL,
  },
];

/** UA는 사용하지 않는다. 네이티브가 명시한 플랫폼과 해당 앱의 공식 URL을 함께 확인한다. */
export function resolveAppUpdateStores(
  capabilities: unknown,
  hasNativeBridge: boolean,
): readonly UpdateStore[] {
  if (!hasNativeBridge || !capabilities || typeof capabilities !== "object") {
    return stores;
  }
  const { platform, storeUrl } = capabilities as Record<string, unknown>;
  const store = stores.find((candidate) => candidate.platform === platform);
  if (!store || typeof storeUrl !== "string") return stores;

  try {
    const url = new URL(storeUrl);
    const official = new URL(store.href);
    if (
      url.protocol !== "https:" ||
      url.host !== official.host ||
      url.username ||
      url.password
    ) {
      return stores;
    }
    const appleAppId = url.pathname.match(
      /^\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?(id\d+)\/?$/,
    )?.[1];
    const matchesApp =
      platform === "ios"
        ? appleAppId !== undefined &&
          appleAppId === official.pathname.split("/").at(-1)
        : url.pathname === official.pathname &&
          url.searchParams.getAll("id").length === 1 &&
          url.searchParams.get("id") === official.searchParams.get("id");
    return matchesApp ? [{ ...store, href: url.href }] : stores;
  } catch {
    return stores;
  }
}
