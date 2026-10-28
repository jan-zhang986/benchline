import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guide-layout";

export const metadata: Metadata = {
  title: "Free AI visibility checker",
  description:
    "What a free AI visibility check can tell you: citability on your site, a prompt pack to run yourself, and a score for an answer you paste in.",
  alternates: { canonical: "/ai-visibility-checker" },
};

const faqs = [
  {
    question: "Does this checker query ChatGPT for every brand?",
    answer:
      "No. The free path crawls your homepage, robots.txt, and llms.txt, then builds prompts you can run yourself. A live API call happens only if the operator has configured a key, and even then it is one cheap prompt with a daily cap, not a multi-engine share-of-voice study.",
  },
  {
    question: "Is the 0–100 score my rank in AI answers?",
    answer:
      "No. It is the sum of on-site checks. A high score means the pages are easier to fetch and parse. It does not mean a model mentions you.",
  },
  {
    question: "Why is the report page public?",
    answer:
      "So you can send one URL to a teammate or a client. Do not run the check on a host you do not want listed on a public page.",
  },
  {
    question: "What should I do after the report?",
    answer:
      "Fix the highest-point gaps, run a few prompts from the pack in the products you care about, and paste those replies into the scorer. Treat disagreement between chats as normal.",
  },
];

export default function Page() {
  return (
    <GuideLayout
      href="/ai-visibility-checker"
      kicker="Checker"
      title="A free AI visibility check that stays on your site"
      lede="Visibility in an answer engine is two problems. Can a crawler read you, and does a model choose to name you? This check answers the first one directly and gives you a way to record the second."
      intro={
        <>
          <p>
            Most “AI visibility” products ask for a brand and return a live share of voice across
            several engines. That is a useful report when you can pay for it, and it is a poor thing
            to fake on a free page. Benchline takes the other route: fetch the pages a crawler would
            fetch, score the signals that make a brand citable, and hand you the prompts a buyer
            actually types.
          </p>
          <p>
            The form asks for a brand, a website, and an optional category. The category is what
            makes the check horizontal. “Best email marketing tools 2026” and “what is Acme” are
            different jobs. A tool that only searches the brand name misses the queries where a
            new vendor gets recommended.
          </p>
        </>
      }
      body={
        <>
          <h2>What you can trust in the result</h2>
          <p>
            The checklist is literal. If GPTBot is disallowed, the row says so. If there is no
            /llms.txt, the row says so. If the H1 never uses the brand, the row says so. Unknown
            means the fetch failed. Unknown is not a polite way of saying you failed.
          </p>
          <p>
            The paste box is the other half. Copy an answer you already have from ChatGPT,
            Perplexity, Gemini, or Claude. The scorer looks for the brand as a whole word, notes
            whether it shows up early, and reads list items and “vs” phrases for other names. It
            does not upload the text.
          </p>
          <h2>What this page will not claim</h2>
          <ul>
            <li>That an API reply matches the consumer chat app.</li>
            <li>That a citability score is a ranking.</li>
            <li>That fixing robots.txt puts you first in an answer.</li>
            <li>That we measured how often any engine mentions you.</li>
          </ul>
          <p>
            If you want the definition behind the category, read{" "}
            <Link href="/what-is-generative-engine-optimization">what generative engine optimization is</Link>
            . If you want the point values, read the{" "}
            <Link href="/methodology">methodology</Link>.
          </p>
        </>
      }
      faqs={faqs}
    />
  );
}
