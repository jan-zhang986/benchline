import type { Metadata } from "next";
import Link from "next/link";
import { CheckerForm } from "@/components/checker-form";
import { POINTS } from "@/lib/readiness";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the Benchline citability score is calculated, what the paste scorer measures, and what the product refuses to claim.",
  alternates: { canonical: "/methodology" },
};

const rows = [
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

export default function MethodologyPage() {
  const total = rows.reduce((sum, row) => sum + row[1], 0);
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">Methodology</p>
      <h1 className="mt-2 text-4xl tracking-tight text-balance md:text-5xl">
        What the score is made of
      </h1>
      <div className="article-copy">
        <p>
          Benchline adds the points below. The maximum is {total}. A missing signal scores zero. A
          fetch that fails scores zero and is labeled unknown, so a timeout is not presented as a
          policy failure.
        </p>
        <p>
          No row is a ChatGPT rank. The whole sum is a citability proxy: whether a crawler is
          allowed in, whether a map file exists, and whether the homepage states the brand in the
          places parsers look first.
        </p>
        <table>
          <thead>
            <tr>
              <th>Check</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
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
          We only test the path “/”.
        </p>
        <p>
          llms.txt: HTTP success, a body that is not an HTML document, and more than a stub of text.
          See <Link href="/llms-txt">the llms.txt note</Link> for the convention we are detecting,
          not certifying.
        </p>
        <p>
          Schema: JSON-LD and microdata on the homepage. Organization includes common subtypes such
          as Corporation and LocalBusiness. FAQ markup only counts if the type is present. We do
          not judge whether the questions are true.
        </p>
        <p>
          Brand match: the brand phrase, or a distinctive word of four letters or more, appears as
          a whole word in the title or H1. “AI” does not match “email”. The meta description needs
          at least a short sentence. HTTPS and canonical are read from the final homepage response.
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
          <li>Whether a third-party site mentions you.</li>
          <li>A guaranteed place, including first place, in any answer.</li>
        </ul>
        <p>
          Weekly tracking is not implemented. The form on the homepage stores an email for a
          waitlist and does not bill anyone.
        </p>
      </div>
      <div className="mt-10">
        <CheckerForm heading="Run a check with this scoring" />
      </div>
    </article>
  );
}
