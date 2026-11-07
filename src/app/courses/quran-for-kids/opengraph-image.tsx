import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const alt = `Online Quran classes for kids — ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -190,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "rgba(228, 193, 142, 0.14)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 120,
            bottom: -260,
            width: 520,
            height: 520,
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
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 14,
                height: 54,
                borderRadius: 999,
                background: "#e4c18e",
                display: "flex",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: 6,
                color: "#d8c29f",
                textTransform: "uppercase",
              }}
            >
              {SITE_NAME}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "flex",
                fontSize: 76,
                lineHeight: 1.04,
                fontWeight: 800,
                letterSpacing: -2.5,
                maxWidth: 940,
              }}
            >
              Online Quran Classes for Kids
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.35,
                color: "#d6e4da",
                maxWidth: 880,
              }}
            >
              One-to-one Quran, Tajweed, and memorization lessons in English,
              adapted to your child&apos;s age.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 21,
              color: "#f3efe8",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
              }}
            >
              Children and teenagers
            </div>
            <div
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
              }}
            >
              Reviewed teachers
            </div>
            <div
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
              }}
            >
              Free trial lesson
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
