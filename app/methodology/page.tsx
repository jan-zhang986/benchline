import type { Metadata } from "next";
import Link from "next/link";
import { CheckerForm } from "@/components/checker-form";
import { POINTS } from "@/lib/readiness";
import { SEO_POINTS } from "@/lib/seo-readiness";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Benchline GEO and SEO readiness scores are calculated from crawlable checks, what the paste scorer measures, and what the product refuses to claim.",
  alternates: { canonical: "/methodology" },
};

const geoRows = [
  ["GPTBot not blocked", POINTS.gptbot],
  ["ClaudeBot not blocked", POINTS.claudebot],
  ["PerplexityBot not blocked", POINTS.perplexitybot],
  ["Google-Extended not blocked", POINTS.googleExtended],
  ["Plain-text /llms.txt", POINTS.llms],
  ["Organization schema", POINTS.organization],
  ["WebSite schema", POINTS.website],
  ["FAQPage schema", POINTS.faq],
  ["Title includes the brand", POINTS.title],
  ["H1 includes the brand", POINTS.h1],
  ["Meta description present", POINTS.description],
  ["HTTPS", POINTS.https],
  ["Canonical link", POINTS.canonical],
] as const;

const seoRows = [
  ["Googlebot not blocked", SEO_POINTS.googlebot],
  ["Sitemap in robots.txt", SEO_POINTS.sitemap],
  ["Indexable (no noindex)", SEO_POINTS.indexable],
  ["Title present", SEO_POINTS.titlePresent],
  ["Meta description", SEO_POINTS.metaDescription],
  ["HTTPS", SEO_POINTS.https],
  ["Canonical link", SEO_POINTS.canonical],
  ["Schema.org or WebSite", SEO_POINTS.schemaOrgOrWebsite],
  ["Open Graph basics (og:title + og:description)", SEO_POINTS.ogBasics],
  ["Twitter card", SEO_POINTS.twitterCard],
  ["HTML lang", SEO_POINTS.htmlLang],
] as const;

export default function MethodologyPage() {
  const geoTotal = geoRows.reduce((sum, row) => sum + row[1], 0);
  const seoTotal = seoRows.reduce((sum, row) => sum + row[1], 0);
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Methodology</p>
      <h1 className="mt-2 text-4xl tracking-tight text-balance md:text-5xl">
        What the scores are made of
      </h1>
      <div className="article-copy">
        <p>
          Benchline returns two independent proxies from the same crawl: a GEO citability score and
          an SEO readiness score. Each sums to 100. A missing signal scores zero. A fetch that fails
          scores zero and is labeled unknown, so a timeout is not presented as a policy failure.
        </p>
        <p>
          No row is a ChatGPT rank, a Google ranking, traffic, or Core Web Vitals. Both sums are
          crawlable checks only.
        </p>

        <h2>GEO citability ({geoTotal} points)</h2>
        <p>
          Whether AI crawlers are allowed in, whether a map file for models exists, and whether the
          homepage states the brand in the places parsers look first.
        </p>
        <table>
          <thead>
            <tr>
              <th>Check</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {geoRows.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>SEO readiness ({seoTotal} points)</h2>
        <p>
          Classic crawlable search basics on the homepage and robots.txt. Separate from GEO on
          purpose: Googlebot is not Google-Extended, and a title that exists is not the same as a
          title that names the brand.
        </p>
        <table>
          <thead>
            <tr>
              <th>Check</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {seoRows.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>How each check is decided</h2>
        <p>
          Robots rules: a specific user-agent group beats <code>*</code>. The longest matching path
          wins, and a tie goes to Allow. No robots.txt means the crawlers are allowed by default.
          We only test the path “/”. SEO also reads <code>Sitemap:</code> lines from that file.
        </p>
        <p>
          llms.txt: HTTP success, a body that is not an HTML document, and more than a stub of text.
          See <Link href="/llms-txt">the llms.txt note</Link> for the convention we are detecting,
          not certifying.
        </p>
        <p>
          Schema: JSON-LD and microdata on the homepage. Organization includes common subtypes such
          as Corporation and LocalBusiness. FAQ markup only counts if the type is present. SEO’s
          schema check passes when any schema.org type is present (WebSite included). We do not
          judge whether the questions are true.
        </p>
        <p>
          Brand match (GEO): the brand phrase, or a distinctive word of four letters or more,
          appears as a whole word in the title or H1. “AI” does not match “email”. The meta
          description needs at least a short sentence. HTTPS and canonical are read from the final
          homepage response.
        </p>
        <p>
          Indexability (SEO): fail when meta robots or <code>X-Robots-Tag</code> includes{" "}
          <code>noindex</code> or <code>none</code>. Open Graph basics need both{" "}
          <code>og:title</code> and <code>og:description</code>. Twitter card needs a{" "}
          <code>twitter:card</code> value. HTML lang needs a non-empty <code>lang</code> on{" "}
          <code>&lt;html&gt;</code>.
        </p>
        <h2>Paste scores</h2>
        <p>
          The paste scorer never calls a model. Early mention, list position, a repeated name, and a
          short line that is mostly the brand add points, capped at 100. Zero means the brand was
          not found as a whole word. Competitor names come from the same list, from “vs” phrases,
          and from names you type. The notes under the score show the arithmetic.
        </p>
        <h2>Live calls, when they exist</h2>
        <p>
          If DataForSEO, OpenAI, or Brave credentials are configured, a report may include up to
          three short API replies, cached for seven days, under a daily quota. They are labeled
          with the provider. An API answer is not the consumer ChatGPT, Claude, Perplexity, or
          Gemini app. If no key is set, the section says the call was skipped and the rest of the
          report still stands.
        </p>
        <h2>What we do not measure</h2>
        <ul>
          <li>Share of voice across engines.</li>
          <li>Historical rank, traffic, or ad cost.</li>
          <li>Core Web Vitals or lab performance scores.</li>
          <li>Whether a third-party site mentions you.</li>
          <li>A guaranteed place, including first place, in any answer or results page.</li>
        </ul>
        <p>
          Weekly tracking is not implemented. The form on the homepage stores an email for a
          waitlist and does not bill anyone. Reports saved before SEO scoring show GEO only and a
          note instead of a fake SEO zero.
        </p>
      </div>
      <div className="mt-10">
        <CheckerForm heading="Run a check with this scoring" />
      </div>
    </article>
  );
}
