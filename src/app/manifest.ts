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
    // Long-press / right-click shortcuts on the installed icon. They are the
    // three screens a signed-in reader opens most, and each works offline from
    // the worker's cached answers once visited.
    shortcuts: [
      {
        name: "Schedule",
        short_name: "Schedule",
        url: "/schedule",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Notifications",
        short_name: "Notifications",
        url: "/notifications",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Profile",
        short_name: "Profile",
        url: "/profile",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
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
      // Android shapes the installed icon as a circle or squircle; the maskable
      // pair keeps the mark inside the 80% safe zone so nothing gets cropped.
      {
        src: "/icon-maskable-192.png?v=2026-11-14",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png?v=2026-11-14",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
