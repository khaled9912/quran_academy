const fallbackUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl
).replace(/\/$/, "");

export const SITE_NAME = "Ana Quran Academy";

// Bump this when the public marketing pages change so sitemap lastmod stays
// meaningful instead of changing on every deploy.
export const CONTENT_LAST_UPDATED = "2026-11-06";

export const IS_PREVIEW_DEPLOYMENT =
  process.env.VERCEL_ENV !== undefined &&
  process.env.VERCEL_ENV !== "production";
export const SITE_SHORT_NAME = "Ana Quran";
export const SITE_DESCRIPTION =
  "Learn Quran online with qualified teachers at Ana Quran Academy. Join personalized Quran, Tajweed, and memorization classes from anywhere in the world.";
export const SITE_TITLE = "Ana Quran Academy | Learn Quran Online Worldwide";

export const SITE_KEYWORDS = [
  "online Quran academy",
  "learn Quran online",
  "online Quran classes",
  "Quran classes online",
  "English Quran teachers",
  "online Quran learning",
  "Quran academy for English speakers",
  "online Quran classes for kids",
  "online Quran classes for adults",
  "learn Quran with Tajweed",
  "Quran memorization online",
  "one-to-one Quran lessons",
  "private online Quran teachers",
  "Quran classes for beginners",
  "online Quran lessons for families",
  "learn Quran online with qualified teachers",
  "online Quran classes for Muslims worldwide",
  "private Quran lessons in English",
  "affordable online Quran classes",
  "learn Quran online from anywhere in the world",
];

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

const OG_IMAGE = {
  url: absoluteUrl("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — Learn Quran Online Worldwide`,
};

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  imageAlt,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
}) {
  const imageUrl = image ? absoluteUrl(image) : OG_IMAGE.url;
  const imageMeta = {
    url: imageUrl,
    width: 1200,
    height: 630,
    alt: imageAlt ?? OG_IMAGE.alt,
  };

  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      title,
      description,
      images: [imageMeta],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [imageUrl],
    },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}
