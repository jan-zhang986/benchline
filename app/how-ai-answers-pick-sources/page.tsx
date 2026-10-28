import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guide-layout";

export const metadata: Metadata = {
  title: "Sources AI answers often trust",
  description:
    "The kinds of pages answer engines often repeat: docs, comparisons, community threads, and review sites. No fake frequency stats.",
  alternates: { canonical: "/how-ai-answers-pick-sources" },
};

const faqs = [
  {
    question: "Did you measure how often each source is cited?",
    answer:
      "No. This page describes source types people repeatedly see in answers. It is not a census, and it has no percentages.",
  },
  {
    question: "Will Benchline tell me if Reddit mentions my brand?",
    answer:
      "No. The crawl reads your homepage, robots.txt, and llms.txt. Third-party mentions are outside that fetch. Paste an answer if you want those names scored in a specific reply.",
  },
  {
    question: "Should I buy placements on review sites?",
    answer:
      "This guide does not recommend a vendor. A review page helps when it is specific and independent. A paid badge with no detail is a weak thing to quote.",
  },
  {
    question: "Where should I start if my homepage already passes?",
    answer:
      "Write one comparison that names real alternatives, and make sure the docs say what the product does in sentences a stranger can repeat.",
  },
];

export default function Page() {
  return (
    <GuideLayout
      href="/how-ai-answers-pick-sources"
      kicker="Sources"
      title="Sources AI answers often lean on"
      lede="Answer engines repeat pages that already state a fact in public. The list below is a set of source types, not a ranking and not a traffic report."
      intro={
        <>
          <p>
            When an answer names a product, it usually has somewhere to point, even if the chat UI
            hides the link. The somewhere is rarely a slogan. It is a doc, a comparison, a thread
            where a practitioner said what they deployed, or a reference page for a brand that is
            already notable.
          </p>
          <p>
            Benchline’s crawl cannot see those places. The report includes this list so the next
            piece of work is obvious after the homepage is readable. Nothing here is a count of
            citations.
          </p>
        </>
      }
      body={
        <>
          <h2>Source types worth writing for</h2>
          <ul>
            <li>
              <strong>Your docs and pricing.</strong> State the job, the limit, and the price in
              sentences. A hero line with no noun is hard to quote.
            </li>
            <li>
              <strong>Comparisons.</strong> “Acme vs Northwind” pages that admit a difference are
              easier to reuse than pages that only praise one logo.
            </li>
            <li>
              <strong>Community threads.</strong> Reddit, Hacker News, and category forums show up
              because people describe failures, not because the domains are magic.
            </li>
            <li>
              <strong>Review sites.</strong> Established review pages already use the “who it is
              for” shape that answers copy. Being listed is not the same as being accurate.
            </li>
            <li>
              <strong>Reference entries.</strong> Wikipedia and similar references matter when a
              subject is notable enough to have one. Most products are not, and should not invent a
              page to force it.
            </li>
            <li>
              <strong>Primary material.</strong> Standards, changelogs, papers, and filings beat a
              rewritten affiliate summary.
            </li>
          </ul>
          <h2>What to ignore</h2>
          <p>
            Ignore advice that assigns a percent of “AI traffic” to any of these. If a tool cannot
            show the query log, it does not have the number. Use the{" "}
            <Link href="/ai-visibility-checker">checker</Link> for the on-site half, and use pasted
            answers for the mention half. The definition of the whole practice is on{" "}
            <Link href="/what-is-generative-engine-optimization">what GEO is</Link>.
          </p>
        </>
      }
      faqs={faqs}
    />
  );
}
