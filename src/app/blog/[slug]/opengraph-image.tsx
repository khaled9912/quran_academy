import { ImageResponse } from "next/og";

import { getBlogPost } from "@/lib/blog";
import { SITE_NAME } from "@/lib/seo";

export const alt = `${SITE_NAME} blog — Quran learning guide`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BlogOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? "Quran Learning Guides";
  const category = post?.category ?? "Ana Quran Academy";
  const titleSize = title.length > 62 ? 48 : title.length > 44 ? 56 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #123c35 0%, #1d4e47 60%, #2a6355 100%)",
          color: "#f3efe8",
          padding: "60px 72px",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -130,
            top: -180,
            width: 540,
            height: 540,
            borderRadius: "50%",
            background: "rgba(228, 193, 142, 0.14)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 140,
            bottom: -280,
            width: 540,
            height: 540,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 14,
                height: 48,
                borderRadius: 999,
                background: "#e4c18e",
                display: "flex",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: 5,
                color: "#d8c29f",
                textTransform: "uppercase",
              }}
            >
              {SITE_NAME} Blog
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                fontSize: 21,
                color: "#f3efe8",
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: titleSize,
                lineHeight: 1.1,
                fontWeight: 800,
                letterSpacing: -1.8,
                maxWidth: 960,
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 21,
              color: "#d6e4da",
            }}
          >
            <div style={{ display: "flex" }}>
              Practical Quran learning guides for English speakers worldwide
            </div>
            <div style={{ display: "flex", color: "#d8c29f" }}>
              {post ? `${post.readingMinutes} min read` : "Read the guide"}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
