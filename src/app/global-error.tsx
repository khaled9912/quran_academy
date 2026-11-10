"use client";

import { reportUnexpectedError } from "@/lib/sentry";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportUnexpectedError(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f6f8f3",
          color: "#1f3b2c",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <main style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#5c6f63", margin: "0 0 20px", lineHeight: 1.5 }}>
            The error has been reported. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              borderRadius: 999,
              border: "1px solid #217a34",
              background: "#217a34",
              color: "#ffffff",
              padding: "10px 20px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
