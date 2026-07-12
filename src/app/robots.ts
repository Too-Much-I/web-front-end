import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/exam/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
