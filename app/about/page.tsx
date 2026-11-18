import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Benchline is: a free GEO and SEO readiness checker that scores citability signals on your site. Not a ChatGPT rank or paid audit.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl tracking-tight">About</h1>
      <div className="article-copy">
        <p>
          Benchline is a free, horizontal checker for generative engine optimization (GEO) and
          classic SEO readiness. It looks at whether AI crawlers and search engines can read your
          public pages, then turns that into a citability score and a shareable report. It is
          software you run against your own site—not a promise that ChatGPT, Claude, Perplexity, or
          any other product will mention you first.
        </p>
        <h2>What it does</h2>
        <p>
          A check fetches your homepage, <code>/robots.txt</code>, and <code>/llms.txt</code>. It
          scores signals such as bot access, schema, titles, HTTPS, and indexability. You get a
          category-style prompt pack to try in the answer products you care about, plus a paste
          scorer that grades text you bring back yourself. Nothing on Benchline scrapes the consumer
          ChatGPT website or claims a rank inside another company&apos;s chat.
        </p>
        <h2>Who it is for</h2>
        <p>
          Founders, marketers, and SEO practitioners who want a quick, honest read on whether their
          site is set up for AI citation and search—not a black-box &quot;AI visibility score&quot;
          sold as placement. Teams comparing two landing pages, agencies sanity-checking a client
          site before a pitch, and operators auditing their own deploy all use the same horizontal
          tool. There is no customer account and no paid audit tier in this version.
        </p>
        <h2>What it is not</h2>
        <p>
          Benchline is not a ChatGPT rank tracker, not a guaranteed #1 placement service, and not a
          substitute for legal, security, or accessibility review. Scores are proxies from crawlable
          signals and from text you paste. Live API snippets, when enabled by whoever deploys the
          app, are not the same as what a consumer sees in a chat UI. For how points are assigned, see{" "}
          <Link href="/methodology">Methodology</Link>.
        </p>
        <p>
          <Link href="/contact">Contact</Link>
          {" · "}
          <Link href="/privacy">Privacy</Link>
          {" · "}
          <Link href="/terms">Terms</Link>
        </p>
      </div>
    </article>
  );
}