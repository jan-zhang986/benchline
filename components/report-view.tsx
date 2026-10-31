import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { PasteScorer } from "@/components/paste-scorer";
import { PromptList } from "@/components/prompt-list";
import { ShareBar } from "@/components/share-bar";
import { TrustedSources } from "@/components/trusted-sources";
import { Badge } from "@/components/ui/badge";
import { WaitlistForm } from "@/components/waitlist-form";
import { GEO_GROUP_ORDER, GROUP_LABEL, scoreBand } from "@/lib/readiness";
import { seoScoreBand } from "@/lib/seo-readiness";
import type { Finding, FindingStatus, ReportRecord } from "@/lib/types";

const STATUS_LABEL: Record<FindingStatus, string> = {
  pass: "Pass",
  fail: "Gap",
  unknown: "Unknown",
};

function statusVariant(status: FindingStatus): "default" | "destructive" | "outline" {
  if (status === "pass") return "default";
  if (status === "fail") return "destructive";
  return "outline";
}

function FindingList({ findings }: { findings: Finding[] }) {
  return (
    <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-card">
      {findings.map((finding) => (
        <li key={finding.id} className="grid gap-2 px-3 py-3 sm:grid-cols-[8rem_1fr_auto] sm:items-start">
          <Badge variant={statusVariant(finding.status)}>{STATUS_LABEL[finding.status]}</Badge>
          <div>
            <p className="font-medium">{finding.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{finding.detail}</p>
          </div>
          <p className="text-sm text-muted-foreground sm:text-right">
            {finding.points}/{finding.maxPoints}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ReportView({ report }: { report: ReportRecord }) {
  const geoBand = scoreBand(report.score);
  const seoBand = report.seoScore == null ? null : seoScoreBand(report.seoScore);
  const date = report.createdAt.slice(0, 10);
  const geoFindings = report.findings.filter(
    (finding) => finding.lane === "geo" || finding.lane === "both",
  );
  const seoFindings = report.findings.filter(
    (finding) => finding.lane === "seo" || finding.lane === "both",
  );

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Public report</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight text-balance md:text-5xl">
        {report.brand} readiness report
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        <a href={report.finalUrl || report.website} className="underline underline-offset-4" rel="noreferrer">
          {report.finalUrl || report.website}
        </a>
        {report.category ? ` · ${report.category}` : ""} · {date} UTC
      </p>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 md:p-6" aria-labelledby="score-heading">
        <h2 id="score-heading" className="sr-only">
          Readiness scores
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">GEO citability</p>
            <p className="font-heading text-6xl tracking-tight md:text-7xl">
              {report.score}
              <span className="text-3xl text-muted-foreground">/100</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              <span className="font-semibold">{geoBand.label}.</span> {geoBand.blurb}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div className="h-full rounded-full bg-primary" style={{ width: `${report.score}%` }} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">SEO readiness</p>
            {report.seoScore == null || !seoBand ? (
              <div className="mt-3 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm leading-relaxed">
                This report was saved before SEO scoring existed. Re-run the check to get a crawlable
                SEO score alongside GEO. We do not invent a zero for older reports.
              </div>
            ) : (
              <>
                <p className="font-heading text-6xl tracking-tight md:text-7xl">
                  {report.seoScore}
                  <span className="text-3xl text-muted-foreground">/100</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed">
                  <span className="font-semibold">{seoBand.label}.</span> {seoBand.blurb}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${report.seoScore}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Both scores are sums of on-site, crawlable checks. They are not ChatGPT, Perplexity,
          Gemini, or Claude ranks, and they are not traffic or Core Web Vitals.
        </p>
        <div className="mt-4">
          <ShareBar path={`/r/${report.id}`} />
        </div>
      </section>

      <AdSlot placement="report" />

      {!geoFindings.some((finding) => finding.group === "onpage" && finding.status !== "unknown") ? (
        <p className="mb-6 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm leading-relaxed">
          The homepage could not be scored. Crawler and llms.txt checks above may still be filled in.
          The prompt pack and paste scorer work either way.
        </p>
      ) : null}

      <section className="mt-2" aria-labelledby="geo-checklist-heading">
        <h2 id="geo-checklist-heading" className="font-heading text-3xl tracking-tight">
          GEO checklist
        </h2>
        <div className="mt-4 space-y-6">
          {GEO_GROUP_ORDER.map((group) => {
            const items = geoFindings.filter((finding) => finding.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
                  {GROUP_LABEL[group]}
                </h3>
                <FindingList findings={items} />
              </div>
            );
          })}
        </div>
      </section>

      {seoFindings.length > 0 ? (
        <section className="mt-12" aria-labelledby="seo-checklist-heading">
          <h2 id="seo-checklist-heading" className="font-heading text-3xl tracking-tight">
            SEO checklist
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Crawlable search basics only: Googlebot, Sitemap, indexability, title, meta, HTTPS,
            canonical, schema, Open Graph, Twitter card, and html lang.
          </p>
          <div className="mt-4">
            <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
              {GROUP_LABEL.seo}
            </h3>
            <FindingList findings={seoFindings} />
          </div>
        </section>
      ) : null}

      <section className="mt-12" aria-labelledby="fixes-heading">
        <h2 id="fixes-heading" className="font-heading text-3xl tracking-tight">
          Top fixes
        </h2>
        {report.fixes.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No gaps in this crawl. That still does not mean models mention {report.brand}.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {report.fixes.map((fix, index) => (
              <li key={fix.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-primary">
                  {index + 1}. {fix.title}
                  <span className="ml-2 font-normal text-muted-foreground">{fix.points} points at stake</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed">{fix.detail}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-12" aria-labelledby="prompts-heading">
        <h2 id="prompts-heading" className="font-heading text-3xl tracking-tight">
          Horizontal prompt pack
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These prompts cover the category, alternatives, the brand itself, and evaluation questions.
          Run the ones that matter in the answer products you care about, then paste the replies below.
          Benchline does not fire this pack at live models on a free check.
        </p>
        {report.categoryDefaulted ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No category was entered, so category prompts use “{report.categoryUsed}”.{" "}
            <Link
              href={`/?brand=${encodeURIComponent(report.brand)}&website=${encodeURIComponent(report.website)}`}
              className="underline underline-offset-4"
            >
              Run again with a category
            </Link>
            .
          </p>
        ) : null}
        <div className="mt-4">
          <PromptList prompts={report.prompts} />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="paste-heading">
        <h2 id="paste-heading" className="font-heading text-3xl tracking-tight">
          Paste an answer
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Paste a reply you already collected. We look for {report.brand}, where it sits, and other
          names in the same list or in a “vs” phrase.
        </p>
        <div className="mt-4">
          <PasteScorer brand={report.brand} website={report.finalUrl || report.website} />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="font-heading text-3xl tracking-tight">
          Sources AI answers often trust
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A homepage crawl cannot see these. They are the places a careful marketer usually works on
          next.
        </p>
        <div className="mt-4">
          <TrustedSources />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="live-heading">
        <h2 id="live-heading" className="font-heading text-3xl tracking-tight">
          Optional live check
        </h2>
        <div className="mt-4 space-y-4">
          {report.live.map((check, index) => (
            <div key={`${check.provider ?? "none"}-${index}`} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">{check.providerLabel}</p>
              <p className="mt-1 text-sm leading-relaxed">{check.detail}</p>
              {check.cached ? (
                <p className="mt-2 text-xs text-muted-foreground">Served from the 7-day cache.</p>
              ) : null}
              {check.prompt ? (
                <p className="mt-3 text-sm">
                  <span className="text-muted-foreground">Prompt. </span>
                  {check.prompt}
                </p>
              ) : null}
              {check.answer ? (
                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap">
                  {check.answer}
                </pre>
              ) : null}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{check.disclaimer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="method-heading">
        <h2 id="method-heading" className="font-heading text-3xl tracking-tight">
          How to read this
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Free checks return two proxies. GEO covers AI crawler access, /llms.txt, Organization /
            WebSite / FAQ schema, and whether the title, H1, description, HTTPS, and canonical agree
            with the brand. SEO covers Googlebot, Sitemap, indexability, title presence, meta,
            HTTPS, canonical, schema.org or WebSite, Open Graph, Twitter card, and html lang.
          </p>
          <p>
            An API answer is not the consumer chat interface. Personalization, browsing, and memory
            change what a person sees. Nothing here is a guaranteed rank, and nothing here claims you
            will be first.
          </p>
          <p>
            <Link href="/methodology" className="underline underline-offset-4">
              Full methodology
            </Link>
            . This page is public and may be indexed.
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-muted/40 p-5" aria-labelledby="track-heading">
        <h2 id="track-heading" className="font-heading text-2xl tracking-tight">
          Weekly tracking
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Recurring checks are not built yet. Leave an email if you want to hear when they are. There
          is no charge and no account.
        </p>
        <div className="mt-4">
          <WaitlistForm source={`/r/${report.id}`} brand={report.brand} />
        </div>
      </section>
    </article>
  );
}
