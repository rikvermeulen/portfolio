import { ImageResponse } from "next/og";

import { SITE } from "@/lib/seo/index.ts";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a0a0a",
        color: "#ffffff",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#8f8f8f",
        }}
      >
        {SITE.jobTitle}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
          {SITE.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#b5b5b5",
            maxWidth: "900px",
          }}
        >
          Building full-scale creative digital experiences in{" "}
          {SITE.location.city}, {SITE.location.country}.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 30,
          color: "#8f8f8f",
        }}
      >
        {SITE.url.replace("https://", "")}
      </div>
    </div>,
    size,
  );
}
