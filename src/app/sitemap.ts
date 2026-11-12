import type { MetadataRoute } from "next";
import { sortedBlogPosts } from "@/lib/blog";
import { CONTENT_LAST_UPDATED, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${CONTENT_LAST_UPDATED}T00:00:00Z`);
  const posts = sortedBlogPosts();
  const blogLastModified = posts[0]
    ? new Date(`${posts[0].updatedAt}T00:00:00Z`)
    : lastModified;

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/courses/quran-for-kids`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/courses/tajweed`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: blogLastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(`${post.updatedAt}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/teach`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
