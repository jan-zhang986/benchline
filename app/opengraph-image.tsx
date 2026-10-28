import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Benchline, a free GEO citability checker";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#f4f0e6",
          color: "#241f1a",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 3, color: "#0e6b4d" }}>
          BENCHLINE
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 68, lineHeight: 1.08, maxWidth: 900 }}>
          See whether AI crawlers can cite your brand
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, maxWidth: 860 }}>
          Citability score, prompt pack, and a paste scorer. Not a ChatGPT rank.
        </div>
      </div>
    ),
    { ...size },
  );
}
