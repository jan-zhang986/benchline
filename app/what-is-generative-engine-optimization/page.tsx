import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guide-layout";

export const metadata: Metadata = {
  title: "What is generative engine optimization?",
  description:
    "A plain definition of generative engine optimization: being named and cited in AI answers, and the parts of that work you can actually change.",
  alternates: { canonical: "/what-is-generative-engine-optimization" },
};

const faqs = [
  {
    question: "Is GEO a ranking factor inside ChatGPT?",
    answer:
      "There is no public ranking factor list for consumer chat answers. GEO is a name for the work of being fetchable, consistent, and corroborated. Anyone who sells a guaranteed model rank is guessing.",
  },
  {
    question: "What can I change this week?",
    answer:
      "Crawler access, a real /llms.txt, a title and H1 that use the brand, FAQ markup that matches visible questions, and one page that compares you with named alternatives.",
  },
  {
    question: "What can I not change from my CMS?",
    answer:
      "Model weights, a user’s memory, and whether a third party chooses to mention you. Those show up when you paste answers, not in a homepage crawl.",
  },
  {
    question: "How does this relate to SEO?",
    answer:
      "SEO still matters. GEO adds crawlers and citation-shaped pages. The side-by-side note is on the GEO and SEO guide.",
  },
];

export default function Page() {
  return (
    <GuideLayout
      href="/what-is-generative-engine-optimization"
      kicker="Definition"
      title="What is generative engine optimization?"
      lede="Generative engine optimization is the work of making a brand easier to fetch, easier to describe accurately, and easier for an answer engine to justify naming."
      intro={
        <>
          <p>
            People shorten that to GEO. The phrase showed up as teams noticed buyers asking chat
            products for “the best tool” instead of clicking ten blue links. The useful version of
            the idea is narrow: write pages that state facts a model can repeat, and do not block
            the crawlers those products use.
          </p>
          <p>
            The inflated version promises a number-one slot in ChatGPT. Nobody outside the model
            provider can sell that. Answers move when the prompt, the account, or the day changes.
            A serious GEO practice records samples and improves the underlying pages. It does not
            publish a fake rank.
          </p>
        </>
      }
      body={
        <>
          <h2>Three layers you can tell apart</h2>
          <ol>
            <li>
              <strong>Access.</strong> GPTBot, ClaudeBot, PerplexityBot, and Google-Extended can
              fetch the URLs you care about. See{" "}
              <Link href="/ai-crawler-robots">the crawler guide</Link>.
            </li>
            <li>
              <strong>Clarity.</strong> The brand string matches in the title, the H1, the
              Organization schema, and <Link href="/llms-txt">llms.txt</Link>. A model that has to
              reconcile three names will often pick none.
            </li>
            <li>
              <strong>Corroboration.</strong> Other pages, not only your homepage, describe the
              same product. The kinds of sources that often get repeated are listed in{" "}
              <Link href="/how-ai-answers-pick-sources">sources answers often trust</Link>. We do
              not pretend to count them.
            </li>
          </ol>
          <h2>A first week that stays small</h2>
          <p>
            Run one citability check. Ship the top fixes that are actually missing, not a redesign.
            Publish or repair /llms.txt. Ask four prompts in the chat products your buyers use, and
            paste the answers so the mention, the position, and the neighboring names are written
            down. Stop there. Weekly charts can wait; the waitlist on this site is for that, and it
            is not a product yet.
          </p>
          <p>
            If you want the free workflow in one place, start at the{" "}
            <Link href="/ai-visibility-checker">AI visibility checker</Link>.
          </p>
        </>
      }
      faqs={faqs}
    />
  );
}
