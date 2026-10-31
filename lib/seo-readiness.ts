import { hasNoindexDirective } from "@/lib/html-signals";
import type { CrawlEvidence } from "@/lib/readiness";
import type { Finding } from "@/lib/types";

/** SEO MVP crawlable checklist. Sum must stay 100. */
export const SEO_POINTS = {
  googlebot: 12,
  sitemap: 12,
  indexable: 12,
  titlePresent: 10,
  metaDescription: 8,
  https: 8,
  canonical: 8,
  schemaOrgOrWebsite: 10,
  ogBasics: 10,
  twitterCard: 5,
  htmlLang: 5,
} as const;

export const SEO_POINT_TOTAL = Object.values(SEO_POINTS).reduce((sum, n) => sum + n, 0);

function clip(value: string, max = 140): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function seoFinding(input: {
  id: string;
  label: string;
  points: number;
  status: Finding["status"];
  detail: string;
  fix: string | null;
}): Finding {
  const points = input.status === "pass" ? input.points : 0;
  return {
    id: input.id,
    group: "seo",
    lane: "seo",
    label: input.label,
    status: input.status,
    points,
    maxPoints: input.points,
    detail: input.detail,
    fix: input.status === "pass" ? null : input.fix,
  };
}

export function buildSeoFindings(evidence: CrawlEvidence): Finding[] {
  const findings: Finding[] = [];

  if (evidence.robotsState === "unknown") {
    findings.push(
      seoFinding({
        id: "seo-googlebot",
        label: "Googlebot allowed",
        points: SEO_POINTS.googlebot,
        status: "unknown",
        detail: "Could not read robots.txt, so Googlebot access is unknown.",
        fix: "Open /robots.txt and confirm Googlebot is not disallowed for “/”.",
      }),
      seoFinding({
        id: "seo-sitemap",
        label: "Sitemap in robots.txt",
        points: SEO_POINTS.sitemap,
        status: "unknown",
        detail: "Could not read robots.txt, so Sitemap directives are unknown.",
        fix: "Add a Sitemap: line in robots.txt that points at your XML sitemap.",
      }),
    );
  } else {
    const googlebotBlocked = evidence.bots.googlebot === "blocked";
    findings.push(
      seoFinding({
        id: "seo-googlebot",
        label: "Googlebot allowed",
        points: SEO_POINTS.googlebot,
        status: googlebotBlocked ? "fail" : "pass",
        detail: googlebotBlocked
          ? "Googlebot is disallowed for “/”."
          : evidence.robotsState === "missing"
            ? "No robots.txt file, so Googlebot is allowed by default."
            : "Googlebot is not blocked for “/”.",
        fix: "Allow Googlebot to fetch public pages. Add a group for that user-agent with “Allow: /”, or remove “Disallow: /”.",
      }),
    );

    const hasSitemap = evidence.sitemaps.length > 0;
    findings.push(
      seoFinding({
        id: "seo-sitemap",
        label: "Sitemap in robots.txt",
        points: SEO_POINTS.sitemap,
        status: hasSitemap ? "pass" : "fail",
        detail: hasSitemap
          ? `Sitemap declared: ${clip(evidence.sitemaps[0] ?? "", 180)}${evidence.sitemaps.length > 1 ? ` (+${evidence.sitemaps.length - 1} more)` : ""}.`
          : evidence.robotsState === "missing"
            ? "No robots.txt file, so no Sitemap directive was found."
            : "robots.txt has no Sitemap: line.",
        fix: "Add a Sitemap: https://example.com/sitemap.xml line to robots.txt (use your real sitemap URL).",
      }),
    );
  }

  const onPageUnknown = !evidence.homepageOk;

  if (onPageUnknown) {
    const detail = evidence.homepageError ?? "The homepage could not be read.";
    const unknownIds: Array<{
      id: string;
      label: string;
      points: number;
      fix: string;
    }> = [
      {
        id: "seo-indexable",
        label: "Indexable (no noindex)",
        points: SEO_POINTS.indexable,
        fix: "Remove noindex from meta robots and X-Robots-Tag on pages you want in search.",
      },
      {
        id: "seo-title-present",
        label: "Title present",
        points: SEO_POINTS.titlePresent,
        fix: "Add a clear <title> on the homepage.",
      },
      {
        id: "seo-meta-description",
        label: "Meta description",
        points: SEO_POINTS.metaDescription,
        fix: "Add a meta description of at least one short sentence.",
      },
      {
        id: "seo-https",
        label: "HTTPS",
        points: SEO_POINTS.https,
        fix: "Serve the site over HTTPS and redirect HTTP to HTTPS.",
      },
      {
        id: "seo-canonical",
        label: "Canonical link",
        points: SEO_POINTS.canonical,
        fix: "Add a rel=canonical link on the homepage that points at the preferred URL.",
      },
      {
        id: "seo-schema",
        label: "Schema.org or WebSite",
        points: SEO_POINTS.schemaOrgOrWebsite,
        fix: "Add JSON-LD (or microdata) with schema.org types, ideally including WebSite.",
      },
      {
        id: "seo-og-basics",
        label: "Open Graph basics",
        points: SEO_POINTS.ogBasics,
        fix: "Add og:title and og:description meta tags on the homepage.",
      },
      {
        id: "seo-twitter-card",
        label: "Twitter card",
        points: SEO_POINTS.twitterCard,
        fix: "Add a twitter:card meta tag (summary or summary_large_image).",
      },
      {
        id: "seo-html-lang",
        label: "HTML lang",
        points: SEO_POINTS.htmlLang,
        fix: "Set lang on the <html> element, for example lang=\"en\".",
      },
    ];
    for (const item of unknownIds) {
      findings.push(
        seoFinding({
          id: item.id,
          label: item.label,
          points: item.points,
          status: "unknown",
          detail,
          fix: item.fix,
        }),
      );
    }
    return findings;
  }

  const blockedIndex = hasNoindexDirective(evidence.metaRobots, evidence.xRobotsTag);
  findings.push(
    seoFinding({
      id: "seo-indexable",
      label: "Indexable (no noindex)",
      points: SEO_POINTS.indexable,
      status: blockedIndex ? "fail" : "pass",
      detail: blockedIndex
        ? `Homepage is marked noindex${evidence.xRobotsTag ? " (X-Robots-Tag or meta robots)" : " (meta robots)"}.`
        : "No noindex directive found on the homepage.",
      fix: "Remove noindex from meta robots and X-Robots-Tag on pages you want in search.",
    }),
  );

  const title = evidence.title.trim();
  findings.push(
    seoFinding({
      id: "seo-title-present",
      label: "Title present",
      points: SEO_POINTS.titlePresent,
      status: title ? "pass" : "fail",
      detail: title ? `Title: “${clip(title)}”.` : "The homepage has no <title>.",
      fix: "Add a clear <title> on the homepage.",
    }),
  );

  const description = evidence.description.trim();
  findings.push(
    seoFinding({
      id: "seo-meta-description",
      label: "Meta description",
      points: SEO_POINTS.metaDescription,
      status: description.length >= 20 ? "pass" : "fail",
      detail:
        description.length >= 20
          ? `Meta description: “${clip(description)}”.`
          : "Meta description is missing or shorter than a sentence.",
      fix: "Add a meta description of at least one short sentence.",
    }),
  );

  const httpsOk = Boolean(evidence.finalUrl?.startsWith("https://"));
  findings.push(
    seoFinding({
      id: "seo-https",
      label: "HTTPS",
      points: SEO_POINTS.https,
      status: httpsOk ? "pass" : "fail",
      detail: httpsOk
        ? `Final URL is ${evidence.finalUrl}.`
        : `Final URL is not HTTPS${evidence.finalUrl ? `: ${evidence.finalUrl}` : ""}.`,
      fix: "Serve the site over HTTPS and redirect HTTP to HTTPS.",
    }),
  );

  const canonical = evidence.canonical.trim();
  findings.push(
    seoFinding({
      id: "seo-canonical",
      label: "Canonical link",
      points: SEO_POINTS.canonical,
      status: canonical ? "pass" : "fail",
      detail: canonical
        ? `Canonical link: ${clip(canonical, 180)}.`
        : "No rel=canonical link on the homepage.",
      fix: "Add a rel=canonical link on the homepage that points at the preferred URL.",
    }),
  );

  const hasWebsite = evidence.schemaTypes.includes("WebSite");
  const hasSchema = evidence.schemaTypes.length > 0;
  findings.push(
    seoFinding({
      id: "seo-schema",
      label: "Schema.org or WebSite",
      points: SEO_POINTS.schemaOrgOrWebsite,
      status: hasSchema ? "pass" : "fail",
      detail: hasWebsite
        ? "Found WebSite structured data."
        : hasSchema
          ? `Found schema.org types: ${clip(evidence.schemaTypes.slice(0, 4).join(", "), 120)}.`
          : "No schema.org JSON-LD or microdata types on the homepage.",
      fix: "Add JSON-LD (or microdata) with schema.org types, ideally including WebSite.",
    }),
  );

  const ogOk = Boolean(evidence.ogTitle.trim() && evidence.ogDescription.trim());
  findings.push(
    seoFinding({
      id: "seo-og-basics",
      label: "Open Graph basics",
      points: SEO_POINTS.ogBasics,
      status: ogOk ? "pass" : "fail",
      detail: ogOk
        ? `og:title and og:description are set.`
        : !evidence.ogTitle.trim() && !evidence.ogDescription.trim()
          ? "Missing og:title and og:description."
          : evidence.ogTitle.trim()
            ? "og:title is set, but og:description is missing."
            : "og:description is set, but og:title is missing.",
      fix: "Add og:title and og:description meta tags on the homepage.",
    }),
  );

  const twitter = evidence.twitterCard.trim();
  findings.push(
    seoFinding({
      id: "seo-twitter-card",
      label: "Twitter card",
      points: SEO_POINTS.twitterCard,
      status: twitter ? "pass" : "fail",
      detail: twitter
        ? `twitter:card is “${clip(twitter, 60)}”.`
        : "No twitter:card meta tag.",
      fix: "Add a twitter:card meta tag (summary or summary_large_image).",
    }),
  );

  const lang = evidence.htmlLang.trim();
  findings.push(
    seoFinding({
      id: "seo-html-lang",
      label: "HTML lang",
      points: SEO_POINTS.htmlLang,
      status: lang ? "pass" : "fail",
      detail: lang ? `html lang=“${clip(lang, 40)}”.` : "The <html> element has no lang attribute.",
      fix: "Set lang on the <html> element, for example lang=\"en\".",
    }),
  );

  return findings;
}

export function totalSeoScore(findings: Finding[]): number {
  return findings
    .filter((finding) => finding.lane === "seo" || finding.lane === "both")
    .reduce((sum, finding) => sum + finding.points, 0);
}

export function seoScoreBand(score: number): { label: string; blurb: string } {
  if (score >= 75) {
    return {
      label: "Search-ready on page",
      blurb:
        "Most crawlable SEO basics in this checklist are present. That is not a ranking or traffic claim.",
    };
  }
  if (score >= 45) {
    return {
      label: "Partly search-ready",
      blurb:
        "Some indexation and markup signals are in place. The gaps are the fetchable checks that failed.",
    };
  }
  return {
    label: "Hard to index cleanly",
    blurb:
      "A search crawler would hit gaps first. Start with Googlebot access, indexability, title, and a Sitemap line.",
  };
}
