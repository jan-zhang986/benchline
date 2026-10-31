import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/report-view";
import { getReport } from "@/lib/reports";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) {
    return { title: "Report not found", robots: { index: false, follow: false } };
  }
  const seoPart =
    report.seoScore == null ? "SEO score not on this legacy report" : `SEO ${report.seoScore}/100`;
  const description = `GEO ${report.score}/100 · ${seoPart} for ${report.brand}. Crawlable on-site signals only. Not a rank.`;
  return {
    title: `${report.brand} GEO + SEO readiness report`,
    description,
    alternates: { canonical: `/r/${report.id}` },
    openGraph: {
      title: `${report.brand} GEO + SEO readiness report`,
      description,
      url: `/r/${report.id}`,
    },
  };
}

function ReportFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm text-muted-foreground">Loading report…</p>
    </div>
  );
}

async function ReportBody({ params }: Props) {
  await connection();
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();
  return <ReportView report={report} />;
}

export default function ReportPage({ params }: Props) {
  return (
    <Suspense fallback={<ReportFallback />}>
      <ReportBody params={params} />
    </Suspense>
  );
}
