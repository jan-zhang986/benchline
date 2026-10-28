import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guide-layout";

export const metadata: Metadata = {
  title: "Does ChatGPT mention my brand?",
  description:
    "How to check whether ChatGPT mentions your brand without treating one screenshot, or one API call, as a rank.",
  alternates: { canonical: "/does-chatgpt-mention-my-brand" },
};

const faqs = [
  {
    question: "Can Benchline see my ChatGPT account?",
    answer:
      "No. Paste the text yourself. The scorer runs in the browser and does not upload the answer.",
  },
  {
    question: "Why did two chats disagree?",
    answer:
      "Chats differ by model, memory, browsing, and the exact wording of the prompt. A single “yes” or “no” is a sample, not a census.",
  },
  {
    question: "Is the OpenAI API the same as the ChatGPT app?",
    answer:
      "No. If this site is configured to call the API, the reply is labeled as an API reply. Do not treat it as what a logged-in user sees.",
  },
  {
    question: "What prompts should I try?",
    answer:
      "Use the prompt pack on your report: category queries, “alternatives to {brand}”, “what is {brand}”, and “is {brand} worth it”. Category queries are where many brands are absent even when the branded query works.",
  },
];

export default function Page() {
  return (
    <GuideLayout
      href="/does-chatgpt-mention-my-brand"
      kicker="Mentions"
      title="Does ChatGPT mention my brand?"
      lede="You can answer that for a specific chat. You cannot answer it once, for every user, from a free web form. Here is a way to look that does not pretend otherwise."
      intro={
        <>
          <p>
            Open a fresh chat. Turn off extra tools if you want a plain answer, or leave them on if
            that is how your buyers use the product — just write down which you did. Ask one prompt
            from the category (“best … tools”), one alternatives prompt, and one “what is {`{brand}`}”
            prompt. Copy the whole reply.
          </p>
          <p>
            Paste it into a Benchline report. The scorer tells you whether the brand appears as a
            whole word, how far into the text the first mention sits, and whether it is item 1 or
            item 7 in a list. Repeat the same prompt in a new chat if the answer will change a
            decision. One screenshot is a story. Three chats are still a sample, and they are a
            better sample.
          </p>
        </>
      }
      body={
        <>
          <h2>What a mention is, and is not</h2>
          <p>
            A mention is the brand string in that answer. It is not a recommendation, not a
            citation, and not proof the model “knows” you. A late mention in a list of twelve is
            still a mention. The paste score separates “named first” from “named at the bottom” so
            you do not flatten those.
          </p>
          <p>
            Other names in the same list are possible competitors. The guess is mechanical. If it
            flags a sentence fragment, ignore it. You can also type the competitors you already
            track so the scorer looks for those spellings on purpose.
          </p>
          <h2>Why we will not show a live ChatGPT rank</h2>
          <p>
            Scraping the ChatGPT website would break their terms and still would not be stable.
            Calling an API is allowed when you have a key, and it answers a different product.{" "}
            <Link href="/free-geo-tools">Free GEO tools</Link> explains that split. The citability
            crawl remains useful either way: if GPTBot cannot fetch the site, you have removed one
            path a future answer could have used. Read{" "}
            <Link href="/ai-crawler-robots">how those robots rules work</Link> before you flip them.
          </p>
        </>
      }
      faqs={faqs}
    />
  );
}
