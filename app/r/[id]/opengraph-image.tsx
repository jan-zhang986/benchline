import { ImageResponse } from "next/og";
import { getReport } from "@/lib/reports";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Benchline citability report";

export default async function ReportImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  const brand = report?.brand ?? "Report";
  const geo = report ? String(report.score) : "–";
  const seo = report?.seoScore == null ? "—" : String(report.seoScore);

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
        <div style={{ display: "flex", marginTop: 12, fontSize: 30 }}>GEO + SEO readiness</div>
        <div style={{ display: "flex", gap: 48, marginTop: 36 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24 }}>GEO</div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontSize: 96, lineHeight: 1 }}>{geo}</div>
              <div style={{ display: "flex", marginLeft: 8, marginBottom: 12, fontSize: 32 }}>/100</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24 }}>SEO</div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontSize: 96, lineHeight: 1 }}>{seo}</div>
              <div style={{ display: "flex", marginLeft: 8, marginBottom: 12, fontSize: 32 }}>/100</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 26 }}>
          Crawlable on-site signals only. Not a rank.
        </div>
      </div>
    ),
    { ...size },
  );
}
