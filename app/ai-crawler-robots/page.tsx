import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guide-layout";

export const metadata: Metadata = {
  title: "robots.txt for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended",
  description:
    "How Benchline reads robots.txt for four AI crawlers, and how to allow them without accidentally blocking ordinary search crawlers.",
  alternates: { canonical: "/ai-crawler-robots" },
};

const faqs = [
  {
    question: "Which user-agents does the score include?",
    answer:
      "GPTBot, ClaudeBot, PerplexityBot, and Google-Extended. Each is its own row. A disallow for one does not automatically fail the others.",
  },
  {
    question: "What if I have no robots.txt?",
    answer:
      "Crawlers are allowed by default. The check marks those rows as a pass and says the file is missing. Publishing a file is still useful, because it makes the policy explicit.",
  },
  {
    question: "Is Google-Extended the same as Googlebot?",
    answer:
      "No. Google-Extended is a control for Google’s generative use. Googlebot is the Search crawler. This score does not grade Googlebot. Do not add “User-agent: * / Disallow: /” to opt out of one bot.",
  },
  {
    question: "Does ChatGPT-User count as GPTBot?",
    answer:
      "No. GPTBot is the training crawler we score. ChatGPT-User is a different agent used when a person asks ChatGPT to browse. Check the vendor’s current docs before you copy a token.",
  },
];

const snippet = `User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: *
Allow: /
Disallow: /admin`;

export default function Page() {
  return (
    <GuideLayout
      href="/ai-crawler-robots"
      kicker="Crawlers"
      title="Four AI crawlers, and the robots.txt lines that mention them"
      lede="Benchline fetches /robots.txt and asks a narrow question: is “/” disallowed for GPTBot, ClaudeBot, PerplexityBot, or Google-Extended? It is a policy reading, not a log of who visited."
      intro={
        <>
          <p>
            A specific user-agent group wins over <code>User-agent: *</code>. The longest matching
            path wins. If an allow and a disallow tie, the allow wins. An empty <code>Disallow:</code>{" "}
            does not block anything. Those are the rules the checker implements, and they match the
            way operators usually intend a file to work.
          </p>
          <p>
            If the file cannot be fetched, every crawler row is unknown and worth zero until you
            run the check again. Unknown is a hole in the evidence, not a verdict that you are
            blocked.
          </p>
        </>
      }
      body={
        <>
          <h2>What each token is for</h2>
          <ul>
            <li>
              <strong>GPTBot</strong> is OpenAI’s crawler token for model training. It is not the
              same string as the agent that fetches a page during a chat.
            </li>
            <li>
              <strong>ClaudeBot</strong> is Anthropic’s crawler token. Older notes also mention
              anthropic-ai. This check looks for ClaudeBot.
            </li>
            <li>
              <strong>PerplexityBot</strong> is Perplexity’s crawler token.
            </li>
            <li>
              <strong>Google-Extended</strong> is Google’s control for generative use. Leaving it
              allowed does not change how Googlebot indexes Search.
            </li>
          </ul>
          <p>
            Confirm the current token in each company’s crawler documentation before you ship a
            change. Names get revised. The score uses the four strings above.
          </p>
          <h2>A conservative allow</h2>
          <p>
            This snippet allows the four agents and keeps a private path out of the wildcard group.
            It is an illustration, not a full policy.
          </p>
          <pre>
            <code>{snippet}</code>
          </pre>
          <p>
            After you edit the file, run the{" "}
            <Link href="/ai-visibility-checker">visibility check</Link> again. Pair it with{" "}
            <Link href="/llms-txt">llms.txt</Link> if you want a crawler that is allowed in to also
            know which URLs you prefer.
          </p>
        </>
      }
      faqs={faqs}
    />
  );
}
