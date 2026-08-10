import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    // Not part of the robots.txt spec, but it's where crawlers already look for
    // extra site metadata, and /llms.txt is cheap to point at.
    host: SITE_URL,
  };
}
