import { brandMatches } from "@/lib/brand";
import type { RobotAccess } from "@/lib/robots-parse";
import type { Finding, Fix } from "@/lib/types";

export const POINTS = {
  gptbot: 8,
  claudebot: 6,
  perplexitybot: 6,
  googleExtended: 5,
  llms: 15,
  organization: 10,
  website: 8,
  faq: 7,
  title: 10,
  h1: 8,
  description: 7,
  https: 5,
  canonical: 5,
} as const;

export type CrawlEvidence = {
  submittedUrl: string;
  finalUrl: string | null;
  homepageOk: boolean;
  homepageError: string | null;
  title: string;
  h1: string;
  description: string;
  canonical: string;
  schemaTypes: string[];
  htmlLang: string;
  ogTitle: string;
  ogDescription: string;
  twitterCard: string;
  metaRobots: string;
  xRobotsTag: string;
  robotsState: "ok" | "missing" | "unknown";
  robotsDetail: string;
  sitemaps: string[];
  bots: {
    gptbot: RobotAccess;
    claudebot: RobotAccess;
    perplexitybot: RobotAccess;
    googleExtended: RobotAccess;
    googlebot: RobotAccess;
  };
  llmsState: "present" | "missing" | "html" | "unknown";
  llmsDetail: string;
};

const ORGANIZATION_TYPES = new Set([
  "Organization",
  "Corporation",
  "LocalBusiness",
  "OnlineBusiness",
  "EducationalOrganization",
  "GovernmentOrganization",
  "NGO",
  "NewsMediaOrganization",
  "MedicalOrganization",
  "Airline",
  "Consortium",
  "LibrarySystem",
  "WorkersUnion",
  "SportsOrganization",
  "PerformingGroup",
  "FundingScheme",
  "Project",
  "SearchRescueOrganization",
]);

function hasSchema(types: string[], names: Set<string> | string): boolean {
  const allowed = typeof names === "string" ? new Set([names]) : names;
  return types.some((type) => allowed.has(type));
}

function clip(value: string, max = 140): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function botFinding(input: {
  id: string;
  label: string;
  token: string;
  points: number;
  access: RobotAccess;
  robotsState: CrawlEvidence["robotsState"];
}): Finding {
  const { id, label, token, points, access, robotsState } = input;
  if (robotsState === "unknown") {
    return {
      id,
      group: "crawlers",
      lane: "geo",
      label,
      status: "unknown",
      points: 0,
      maxPoints: points,
      detail: `Could not read robots.txt, so ${label} access is unknown.`,
      fix: `Open /robots.txt and confirm ${token} is not disallowed for “/”.`,
    };
  }
  if (access === "blocked") {
    return {
      id,
      group: "crawlers",
      lane: "geo",
      label,
      status: "fail",
      points: 0,
      maxPoints: points,
      detail: `${label} is disallowed for “/”.`,
      fix: `Allow ${token} to fetch public pages. Add a group for that user-agent with “Allow: /”, or remove “Disallow: /”. Avoid a blanket User-agent: * disallow if you only meant to opt out of one crawler.`,
    };
  }
  const viaDefault = robotsState === "missing";
  return {
    id,
    group: "crawlers",
    lane: "geo",
    label,
    status: "pass",
    points,
    maxPoints: points,
    detail: viaDefault
      ? `No robots.txt file, so ${label} is allowed by default.`
      : `${label} is not blocked for “/”.`,
    fix: null,
  };
}

export function buildFindings(brand: string, evidence: CrawlEvidence): Finding[] {
  const findings: Finding[] = [
    botFinding({
      id: "gptbot",
      label: "GPTBot allowed",
      token: "GPTBot",
      points: POINTS.gptbot,
      access: evidence.bots.gptbot,
      robotsState: evidence.robotsState,
    }),
    botFinding({
      id: "claudebot",
      label: "ClaudeBot allowed",
      token: "ClaudeBot",
      points: POINTS.claudebot,
      access: evidence.bots.claudebot,
      robotsState: evidence.robotsState,
    }),
    botFinding({
      id: "perplexitybot",
      label: "PerplexityBot allowed",
      token: "PerplexityBot",
      points: POINTS.perplexitybot,
      access: evidence.bots.perplexitybot,
      robotsState: evidence.robotsState,
    }),
    botFinding({
      id: "google-extended",
      label: "Google-Extended allowed",
      token: "Google-Extended",
      points: POINTS.googleExtended,
      access: evidence.bots.googleExtended,
      robotsState: evidence.robotsState,
    }),
  ];

  if (evidence.llmsState === "present") {
    findings.push({
      id: "llms",
      group: "llms",
      lane: "geo",
      label: "llms.txt present",
      status: "pass",
      points: POINTS.llms,
      maxPoints: POINTS.llms,
      detail: evidence.llmsDetail,
      fix: null,
    });
  } else if (evidence.llmsState === "unknown") {
    findings.push({
      id: "llms",
      group: "llms",
      lane: "geo",
      label: "llms.txt present",
      status: "unknown",
      points: 0,
      maxPoints: POINTS.llms,
      detail: evidence.llmsDetail,
      fix: `Publish a plain-text /llms.txt file that names ${brand}, summarizes the offer, and links to pages worth quoting. See the community convention at llmstxt.org. The file does not guarantee a citation.`,
    });
  } else {
    findings.push({
      id: "llms",
      group: "llms",
      lane: "geo",
      label: "llms.txt present",
      status: "fail",
      points: 0,
      maxPoints: POINTS.llms,
      detail: evidence.llmsDetail,
      fix: `Publish a plain-text /llms.txt file that names ${brand}, summarizes the offer, and links to pages worth quoting. An H1 with the site name is the only required section in the llmstxt.org convention. The file does not guarantee a citation.`,
    });
  }

  const onPageUnknown = !evidence.homepageOk;

  const schema = (
    id: string,
    label: string,
    points: number,
    present: boolean,
    fix: string,
  ): Finding => {
    if (onPageUnknown) {
      return {
        id,
        group: "schema",
        lane: "geo",
        label,
        status: "unknown",
        points: 0,
        maxPoints: points,
        detail: evidence.homepageError ?? "The homepage could not be read.",
        fix,
      };
    }
    return {
      id,
      group: "schema",
      lane: "geo",
      label,
      status: present ? "pass" : "fail",
      points: present ? points : 0,
      maxPoints: points,
      detail: present
        ? `Found ${label.replace(" schema", "")} structured data.`
        : `No ${label.replace(" schema", "")} structured data in JSON-LD or microdata.`,
      fix: present ? null : fix,
    };
  };

  findings.push(
    schema(
      "organization",
      "Organization schema",
      POINTS.organization,
      hasSchema(evidence.schemaTypes, ORGANIZATION_TYPES),
      `Add Organization JSON-LD (or a specific subtype such as Corporation) with the name “${brand}”, url, and logo.`,
    ),
    schema(
      "website",
      "WebSite schema",
      POINTS.website,
      hasSchema(evidence.schemaTypes, "WebSite"),
      "Add WebSite JSON-LD with the site name and url so the brand and the domain are explicitly tied together.",
    ),
    schema(
      "faq",
      "FAQ schema",
      POINTS.faq,
      hasSchema(evidence.schemaTypes, "FAQPage"),
      "Add FAQPage JSON-LD only for questions the page actually answers. Do not mark up questions that are not visible.",
    ),
  );

  const textFinding = (
    id: string,
    label: string,
    points: number,
    ok: boolean,
    detail: string,
    fix: string,
  ): Finding => {
    if (onPageUnknown) {
      return {
        id,
        group: "onpage",
        lane: "geo",
        label,
        status: "unknown",
        points: 0,
        maxPoints: points,
        detail: evidence.homepageError ?? "The homepage could not be read.",
        fix,
      };
    }
    return {
      id,
      group: "onpage",
      lane: "geo",
      label,
      status: ok ? "pass" : "fail",
      points: ok ? points : 0,
      maxPoints: points,
      detail,
      fix: ok ? null : fix,
    };
  };

  const title = evidence.title.trim();
  const h1 = evidence.h1.trim();
  const description = evidence.description.trim();
  findings.push(
    textFinding(
      "title",
      "Title names the brand",
      POINTS.title,
      Boolean(title) && brandMatches(brand, title),
      title
        ? brandMatches(brand, title)
          ? `Title includes the brand: “${clip(title)}”.`
          : `Title does not include the brand: “${clip(title)}”.`
        : "The homepage has no <title>.",
      `Put “${brand}” in the homepage <title> and use that same name in the H1 and in visible copy.`,
    ),
    textFinding(
      "h1",
      "H1 names the brand",
      POINTS.h1,
      Boolean(h1) && brandMatches(brand, h1),
      h1
        ? brandMatches(brand, h1)
          ? `H1 includes the brand: “${clip(h1)}”.`
          : `H1 does not include the brand: “${clip(h1)}”.`
        : "The homepage has no H1.",
      `Use one H1 that includes “${brand}” and states what the product is.`,
    ),
    textFinding(
      "description",
      "Meta description",
      POINTS.description,
      description.length >= 20,
      description.length >= 20
        ? `Meta description: “${clip(description)}”.`
        : "Meta description is missing or shorter than a sentence.",
      `Write a meta description of at least one sentence that says what ${brand} does. Short, specific lines are easier to quote.`,
    ),
    textFinding(
      "https",
      "HTTPS",
      POINTS.https,
      Boolean(evidence.finalUrl?.startsWith("https://")),
      evidence.finalUrl?.startsWith("https://")
        ? `Final URL is ${evidence.finalUrl}.`
        : `Final URL is not HTTPS${evidence.finalUrl ? `: ${evidence.finalUrl}` : ""}.`,
      "Serve the site over HTTPS and redirect HTTP to HTTPS.",
    ),
    textFinding(
      "canonical",
      "Canonical link",
      POINTS.canonical,
      evidence.canonical.trim().length > 0,
      evidence.canonical.trim()
        ? `Canonical link: ${clip(evidence.canonical, 180)}.`
        : "No rel=canonical link on the homepage.",
      "Add a rel=canonical link on the homepage that points at the preferred URL.",
    ),
  );

  return findings;
}

/** GEO citability score from geo/both findings only. */
export function totalScore(findings: Finding[]): number {
  return findings
    .filter((finding) => finding.lane === "geo" || finding.lane === "both")
    .reduce((sum, finding) => sum + finding.points, 0);
}

export function buildFixes(findings: Finding[]): Fix[] {
  return findings
    .filter((finding) => finding.status !== "pass" && finding.fix)
    .sort((a, b) => b.maxPoints - a.maxPoints || a.label.localeCompare(b.label))
    .slice(0, 8)
    .map((finding) => ({
      id: finding.id,
      title: finding.label,
      detail: finding.fix as string,
      points: finding.maxPoints - finding.points,
    }));
}

export function scoreBand(score: number): { label: string; blurb: string } {
  if (score >= 75) {
    return {
      label: "Citable on site",
      blurb:
        "Most on-site signals in this checklist are present. That still does not mean any model mentions the brand.",
    };
  }
  if (score >= 45) {
    return {
      label: "Partly citable",
      blurb:
        "Some signals are in place. The fixes are the gaps a crawler or parser would hit first.",
    };
  }
  return {
    label: "Hard to cite",
    blurb:
      "A crawler would have to guess. Start with crawler access, a brand in the title and H1, and a real /llms.txt.",
  };
}

export const GROUP_LABEL = {
  crawlers: "AI crawler access",
  llms: "llms.txt",
  schema: "Structured data",
  onpage: "On-page brand signals",
  seo: "SEO crawlable checks",
} as const;

export const GROUP_ORDER = ["crawlers", "llms", "schema", "onpage", "seo"] as const;
export const GEO_GROUP_ORDER = ["crawlers", "llms", "schema", "onpage"] as const;
export const SEO_GROUP_ORDER = ["seo"] as const;
