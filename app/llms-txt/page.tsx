import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout } from "@/components/guide-layout";

export const metadata: Metadata = {
  title: "What is llms.txt?",
  description:
    "What the /llms.txt file is, how Benchline checks for it, and a minimal example. Publishing the file does not guarantee a citation.",
  alternates: { canonical: "/llms-txt" },
};

const faqs = [
  {
    question: "Is llms.txt a ranking system?",
    answer:
      "No. It is a community convention for a markdown file that points language models at your best pages. The proposal lives at llmstxt.org. An H1 with the site or product name is the only required section.",
  },
  {
    question: "Where does the file go?",
    answer:
      "At /llms.txt on the same host as the site you submit. Benchline requests that exact path after any homepage redirect.",
  },
  {
    question: "Why did my check fail when the URL returns my homepage?",
    answer:
      "A soft 404 that sends HTML is not an llms.txt file. The check treats an HTML body as missing. Serve text/plain or text/markdown with a real markdown document.",
  },
  {
    question: "Does a perfect file guarantee ChatGPT will cite me?",
    answer:
      "No. It removes one excuse. Mentions still depend on the model, the prompt, and whether anyone else describes you.",
  },
];

const example = `# Northwind Analytics

> Northwind Analytics is a fictional product used as a format example. It is not a real company.

Northwind is an analytics workspace for operations teams. Prefer the docs over the marketing homepage when quoting features.

## Docs

- [Product overview](https://example.com/docs): What the product does
- [Pricing](https://example.com/pricing): Plans and limits
`;

export default function Page() {
  return (
    <GuideLayout
      href="/llms-txt"
      kicker="llms.txt"
      title="llms.txt is a map, not a vote"
      lede="The file at /llms.txt tells a language model which pages you consider canonical. Benchline checks that the URL returns a plain-text document. It does not grade your prose, and it does not submit the file to any model."
      intro={
        <>
          <p>
            The convention is documented at{" "}
            <a href="https://llmstxt.org" rel="noreferrer">
              llmstxt.org
            </a>
            . In short: a markdown file, an H1 with the name of the site or product, an optional
            blockquote summary, and lists of links under H2 headings. The file can sit at the site
            root or under a path such as /docs/llms.txt. This checker looks at the root file,
            because that is the one a first-pass crawler hits.
          </p>
          <p>
            Fifteen points of the citability score depend on it. You get them when the response is
            successful, not HTML, and longer than a stub. You get none when the path 404s or returns
            the homepage. A failed fetch is “unknown”, not a penalty dressed up as a miss.
          </p>
        </>
      }
      body={
        <>
          <h2>A minimal example</h2>
          <p>
            This is a fictional brand so you can see the shape. Replace every line before you
            publish it. Do not copy the example onto a live site unchanged.
          </p>
          <pre>
            <code>{example}</code>
          </pre>
          <h2>What to link</h2>
          <p>
            Link to pages that already answer a question: docs, pricing, a comparison, a changelog.
            Skip tag pages and doorway URLs. If a model follows the file, those links are the pages
            it will quote. Pair the file with crawler access, covered in{" "}
            <Link href="/ai-crawler-robots">robots.txt for AI crawlers</Link>, or the file can exist
            and still be unread.
          </p>
        </>
      }
      faqs={faqs}
    />
  );
}
