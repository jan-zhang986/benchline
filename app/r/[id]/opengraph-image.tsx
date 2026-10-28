import { ImageResponse } from "next/og";
import { getReport } from "@/lib/reports";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Benchline citability report";

export default async function ReportImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  const brand = report?.brand ?? "Report";
  const score = report ? String(report.score) : "–";

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
          padding: "64px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 3, color: "#0e6b4d" }}>
          BENCHLINE
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 68, lineHeight: 1.05 }}>{brand}</div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 30 }}>GEO citability proxy</div>
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 36 }}>
          <div style={{ display: "flex", fontSize: 120, lineHeight: 1 }}>{score}</div>
          <div style={{ display: "flex", marginLeft: 12, marginBottom: 14, fontSize: 40 }}>/100</div>
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 26 }}>
          On-site signals only. Not a ChatGPT rank.
        </div>
      </div>
    ),
    { ...size },
  );
}
