import type { MetadataRoute } from "next";
import { IS_PREVIEW_DEPLOYMENT, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (IS_PREVIEW_DEPLOYMENT) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/blog",
          "/contact",
          "/courses",
          "/teach",
        ],
        disallow: [
          "/api/",
          "/monitoring",
          "/admin/",
          "/super-admin/",
          "/teacher/",
          "/student/",
          "/student-dashboard/",
          "/support/",
          "/parent/",
          "/teachers",
          "/schedule",
          "/lesson/",
          "/sessions",
          "/assignments",
          "/invoices",
          "/profile",
          "/notifications",
          "/login",
          "/signup",
          "/forgot-password",
          "/sentry-example-page",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
