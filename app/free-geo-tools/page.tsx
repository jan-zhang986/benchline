import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guide-layout";

export const metadata: Metadata = {
  title: "Free GEO tools you can use this week",
  description:
    "A practical map of free generative engine optimization checks: citability crawls, prompt lists, paste scoring, and what paid suites do instead.",
  alternates: { canonical: "/free-geo-tools" },
};

const faqs = [
  {
    question: "Is Benchline trying to be a free Ahrefs or Semrush?",
    answer:
      "No. Those products publish AI visibility checks aimed at live multi-engine share of voice. Benchline does not run that workflow on every free submission. It crawls citability, stores a shareable report, and scores text you paste.",
  },
  {
    question: "Which free checks need no API key?",
    answer:
      "The citability crawl, the prompt pack, and the paste scorer. Live engine calls are optional and stay off until an operator adds a key.",
  },
  {
    question: "Are there official validators I should use too?",
    answer:
      "Yes. Use a structured-data validator for JSON-LD, and read your own /robots.txt. Benchline is a single pass over the homepage, not a replacement for those tools.",
  },
  {
    question: "Will you add billing for tracking?",
    answer:
      "Not in this version. Weekly tracking is a waitlist. There is no checkout.",
  },
];

export default function Page() {
  return (
    <GuideLayout
      href="/free-geo-tools"
      kicker="Tools"
      title="Free GEO tools, sorted by what they can actually see"
      lede="“Free GEO tool” covers several different jobs. Mixing them up is how teams buy a dashboard and still do not know if GPTBot is blocked."
      intro={
        <>
          <p>
            One job is access: can a crawler fetch the site, and is the brand written the same way
            in the title and the H1? Another job is sampling: what does a specific answer product
            say when you ask a specific prompt today? A third job is memory: did that answer change
            since last week? Free tools are good at the first, uneven at the second, and usually
            honest when they refuse the third.
          </p>
          <p>
            Benchline is built for the first job, plus a notebook for the second. You get a
            permanent <span className="whitespace-nowrap">/r/…</span> report, a horizontal prompt
            pack, and a paste scorer. You do not get a historical chart.
          </p>
        </>
      }
      body={
        <>
          <h2>Use these in this order</h2>
          <ol>
            <li>
              Run the citability check. Fix blocked crawlers, a missing llms.txt, and a title that
              never says the brand. The point values are on the{" "}
              <Link href="/methodology">methodology page</Link>.
            </li>
            <li>
              Validate JSON-LD in a schema validator if the report says Organization or FAQ markup
              is missing and you thought it was there. Our parser reads JSON-LD and microdata on the
              homepage only.
            </li>
            <li>
              Run four prompts yourself: one category prompt, one alternatives prompt, a “what is
              this brand” prompt, and an “is it worth it” prompt. Paste each reply.{" "}
              <Link href="/does-chatgpt-mention-my-brand">This walkthrough</Link> is the whole
              method.
            </li>
            <li>
              If you need ongoing multi-engine share of voice, look at a paid suite that publishes
              that product. Ahrefs and Semrush both offer AI visibility checks with that shape.
              Copying it on every free hit is out of scope here.
            </li>
          </ol>
          <h2>What we left out on purpose</h2>
          <p>
            No invented comparison scores, no traffic estimates, and no “AI search volume”. If a
            number is not computed from your crawl or from text you pasted, it is not on the page.
            The longer definition of the work is{" "}
            <Link href="/what-is-generative-engine-optimization">what generative engine optimization is</Link>.
          </p>
        </>
      }
      faqs={faqs}
    />
  );
}
