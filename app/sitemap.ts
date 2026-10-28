import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { GUIDES } from "@/lib/guides";
import { listReportPaths } from "@/lib/reports";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = getSiteUrl();
  const staticPaths = [
    { path: "/", priority: 1 },
    { path: "/methodology", priority: 0.7 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    ...GUIDES.map((guide) => ({ path: guide.href, priority: 0.8 })),
  ];
  let reports: { id: string; createdAt: string }[] = [];
  try {
    reports = await listReportPaths(500);
  } catch {
    reports = [];
  }
  return [
    ...staticPaths.map((item) => ({
      url: `${base}${item.path}`,
      changeFrequency: "weekly" as const,
      priority: item.priority,
    })),
    ...reports.map((report) => ({
      url: `${base}/r/${report.id}`,
      lastModified: report.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
