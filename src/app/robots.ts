import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/profile"] }],
    sitemap: "https://tanga-schools-hub.vercel.app/sitemap.xml",
  };
}
