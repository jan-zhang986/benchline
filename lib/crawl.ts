import { fetchPublic } from "@/lib/fetch-public";
import { looksLikeHtml, parsePage } from "@/lib/html-signals";
import type { CrawlEvidence } from "@/lib/readiness";
import { accessFor, parseRobotsDocument } from "@/lib/robots-parse";

const EMPTY_BOTS: CrawlEvidence["bots"] = {
  gptbot: "unspecified",
  claudebot: "unspecified",
  perplexitybot: "unspecified",
  googleExtended: "unspecified",
  googlebot: "unspecified",
};

const EMPTY_PAGE_FIELDS = {
  title: "",
  h1: "",
  description: "",
  canonical: "",
  schemaTypes: [] as string[],
  htmlLang: "",
  ogTitle: "",
  ogDescription: "",
  twitterCard: "",
  metaRobots: "",
  xRobotsTag: "",
};

function robotsFrom(page: Awaited<ReturnType<typeof fetchPublic>>): Pick<
  CrawlEvidence,
  "robotsState" | "robotsDetail" | "bots" | "sitemaps"
> {
  if (!page.ok && page.status === 0) {
    return {
      robotsState: "unknown",
      robotsDetail: page.error ?? "Could not fetch /robots.txt.",
      bots: EMPTY_BOTS,
      sitemaps: [],
    };
  }
  if (page.status === 404 || page.status === 410) {
    return {
      robotsState: "missing",
      robotsDetail: "No robots.txt file was found. Crawlers are allowed by default.",
      bots: EMPTY_BOTS,
      sitemaps: [],
    };
  }
  if (!page.ok) {
    return {
      robotsState: "unknown",
      robotsDetail: page.error ?? "Could not fetch /robots.txt.",
      bots: EMPTY_BOTS,
      sitemaps: [],
    };
  }
  if (looksLikeHtml(page.body, page.contentType)) {
    return {
      robotsState: "missing",
      robotsDetail:
        "/robots.txt returned a web page, so there is no crawler policy. Crawlers are allowed by default.",
      bots: EMPTY_BOTS,
      sitemaps: [],
    };
  }
  const parsed = parseRobotsDocument(page.body);
  return {
    robotsState: "ok",
    robotsDetail: `Read robots.txt from ${page.url}.`,
    sitemaps: parsed.sitemaps,
    bots: {
      gptbot: accessFor(parsed.groups, "gptbot"),
      claudebot: accessFor(parsed.groups, "claudebot"),
      perplexitybot: accessFor(parsed.groups, "perplexitybot"),
      googleExtended: accessFor(parsed.groups, "google-extended"),
      googlebot: accessFor(parsed.groups, "googlebot"),
    },
  };
}

function llmsFrom(page: Awaited<ReturnType<typeof fetchPublic>>): Pick<
  CrawlEvidence,
  "llmsState" | "llmsDetail"
> {
  if (!page.ok && (page.status === 404 || page.status === 410)) {
    return {
      llmsState: "missing",
      llmsDetail: "No /llms.txt file was found.",
    };
  }
  if (!page.ok) {
    return {
      llmsState: "unknown",
      llmsDetail: page.error ?? "Could not fetch /llms.txt.",
    };
  }
  if (looksLikeHtml(page.body, page.contentType)) {
    return {
      llmsState: "html",
      llmsDetail: "/llms.txt returned HTML, not a plain-text llms file.",
    };
  }
  if (page.body.trim().length < 20) {
    return {
      llmsState: "missing",
      llmsDetail: "/llms.txt responded but the file is effectively empty.",
    };
  }
  return {
    llmsState: "present",
    llmsDetail: `Found a plain-text /llms.txt (${page.body.trim().length} characters) at ${page.url}.`,
  };
}

export async function crawlSite(url: URL): Promise<CrawlEvidence> {
  const homepage = await fetchPublic(url, {
    maxBytes: 1_500_000,
    timeoutMs: 7000,
    accept: "html",
  });

  let origin: URL;
  try {
    origin = new URL(homepage.ok ? homepage.url : url.toString());
  } catch {
    origin = url;
  }

  const [robots, llms] = await Promise.all([
    fetchPublic(new URL("/robots.txt", origin.origin), {
      maxBytes: 200_000,
      timeoutMs: 5000,
      accept: "text",
    }),
    fetchPublic(new URL("/llms.txt", origin.origin), {
      maxBytes: 200_000,
      timeoutMs: 5000,
      accept: "text",
    }),
  ]);

  const robotFields = robotsFrom(robots);
  const llmsFields = llmsFrom(llms);
  const xRobotsTag = homepage.headers["x-robots-tag"] ?? "";

  if (!homepage.ok || !looksLikeHtml(homepage.body, homepage.contentType)) {
    const error = !homepage.ok
      ? homepage.error ?? "The homepage could not be read."
      : "The homepage was not HTML, so title, headings, and schema could not be read.";
    return {
      submittedUrl: url.toString(),
      finalUrl: homepage.url || null,
      homepageOk: false,
      homepageError: error,
      ...EMPTY_PAGE_FIELDS,
      xRobotsTag,
      ...robotFields,
      ...llmsFields,
    };
  }

  const signals = parsePage(homepage.body);
  return {
    submittedUrl: url.toString(),
    finalUrl: homepage.url,
    homepageOk: true,
    homepageError: null,
    title: signals.title,
    h1: signals.h1,
    description: signals.description,
    canonical: signals.canonical,
    schemaTypes: signals.schemaTypes,
    htmlLang: signals.htmlLang,
    ogTitle: signals.ogTitle,
    ogDescription: signals.ogDescription,
    twitterCard: signals.twitterCard,
    metaRobots: signals.metaRobots,
    xRobotsTag,
    ...robotFields,
    ...llmsFields,
  };
}
