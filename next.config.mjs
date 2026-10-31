import path from "path";
import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    // Same-origin proxy to the .NET API: keeps the auth cookie on this domain,
    // so middleware.ts can read it and browsers do not treat it as third-party.
    // Inert unless API_ORIGIN is set at build time.
    const apiOrigin = process.env.API_ORIGIN?.replace(/\/$/, "");
    if (!apiOrigin) return [];
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
