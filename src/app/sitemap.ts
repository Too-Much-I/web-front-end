import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/contact", "/terms", "/privacy"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
