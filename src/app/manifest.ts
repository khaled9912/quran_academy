import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_SHORT_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description: SITE_DESCRIPTION,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "en",
    dir: "ltr",
    background_color: "#f3efe8",
    theme_color: "#1d4e47",
    categories: ["education"],
    icons: [
      {
        src: "/icon-192.png?v=2026-11-06-2",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png?v=2026-11-06-2",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
