import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guide-layout";

export const metadata: Metadata = {
  title: "GEO and SEO, side by side",
  description:
    "How generative engine optimization relates to classic SEO: shared work, different crawlers, and why a ranking is not a citation.",
  alternates: { canonical: "/geo-seo" },
};

const faqs = [
  {
    question: "Does GEO replace SEO?",
    answer:
      "No. Search still sends people to pages. GEO is the extra work of being quotable in an answer. Teams that abandon titles, internal links, and indexation usually get worse at both.",
  },
  {
    question: "Is Google-Extended the same as Googlebot?",
    answer:
      "No. Googlebot crawls for Search. Google-Extended is a separate control for Google’s generative training use. Blocking one does not automatically block the other, and blocking star (*) can block both if you are careless.",
  },
  {
    question: "Should every SEO page also be an “AI page”?",
    answer:
      "Write pages a person would still want. Comparison pages, docs, and pricing are useful to both a searcher and an answer engine. Thin pages that exist only to mention a model are not.",
  },
  {
    question: "Where does Benchline sit?",
    answer:
      "It returns two on-site proxies from the same crawl: GEO (AI crawlers, llms.txt, schema, brand consistency) and SEO (Googlebot, Sitemap, indexability, classic markup). It does not replace rank tracking, and it does not replace opening a chat product and reading the answer.",
  },
];

export default function Page() {
  return (
    <GuideLayout
      href="/geo-seo"
      kicker="GEO and SEO"
      title="GEO sits next to SEO. It does not retire it."
      lede="Search optimization earns a listing in a results page. Generative engine optimization earns a mention inside an answer. The work overlaps, and the failure modes do not."
      intro={
        <>
          <p>
            A useful SEO page is specific, internally linked, and allowed in robots.txt. A useful
            GEO page is those things, plus easy for a non-Google crawler to fetch, and easy to quote
            without inventing the product. If your title says one brand and your H1 says another,
            both a search snippet and an answer get worse.
          </p>
          <p>
            The split shows up in the crawlers. Classic SEO cares about Googlebot and Bingbot.
            Answer products also fetch with GPTBot, ClaudeBot, PerplexityBot, and controls such as
            Google-Extended. A site can rank in Google Search and still tell GPTBot to stay out.
          </p>
        </>
      }
      body={
        <>
          <h2>Same job, different proof</h2>
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>SEO</th>
                <th>GEO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Where does the person look?</td>
                <td>A results page of links</td>
                <td>An answer that may not link at all</td>
              </tr>
              <tr>
                <td>What does “winning” look like?</td>
                <td>A ranking you can recheck</td>
                <td>A mention that changes between chats</td>
              </tr>
              <tr>
                <td>What do you control today?</td>
                <td>Pages, links, indexation</td>
                <td>Access, clarity, and corroboration elsewhere</td>
              </tr>
              <tr>
                <td>What can a free crawl prove?</td>
                <td>Whether the page is fetchable and marked up</td>
                <td>The same, for AI user-agents and llms.txt</td>
              </tr>
            </tbody>
          </table>
          <p>
            The table is a map, not a study. Nobody on this site counted queries or clicks to fill
            it in.
          </p>
          <h2>A practical split of labor</h2>
          <p>
            Keep the SEO basics Benchline scores separately: Googlebot allowed, a Sitemap line,
            no noindex, a title, meta description, HTTPS, canonical, schema.org or WebSite, Open
            Graph basics, a Twitter card, and html lang. Add the GEO basics: an explicit allow for
            the AI crawlers you want, a short /llms.txt, and Organization plus WebSite schema that
            use the same brand name in the title and H1. Then write one comparison page that names
            alternatives without hiding yours.
          </p>
          <p>
            Point tables for both scores live on the{" "}
            <Link href="/methodology">methodology</Link> page. Details on the crawler file live in{" "}
            <Link href="/ai-crawler-robots">robots.txt for AI crawlers</Link>. The file convention
            is covered in <Link href="/llms-txt">what llms.txt is</Link>.
          </p>
        </>
      }
      faqs={faqs}
    />
  );
}
