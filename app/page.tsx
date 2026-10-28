import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckerForm } from "@/components/checker-form";
import { JsonLd } from "@/components/json-ld";
import { WaitlistForm } from "@/components/waitlist-form";
import { GUIDES } from "@/lib/guides";
import { renderPromptPack } from "@/lib/prompt-pack";
import { SITE_DESCRIPTION, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const homeFaqs = [
  {
    question: "What is Benchline?",
    answer:
      "Benchline is a horizontal check for any brand. It scores citability on your site, gives you a prompt pack across the category, and grades an answer you paste in.",
  },
  {
    question: "Does Benchline scrape ChatGPT or promise first place?",
    answer:
      "No. It does not scrape ChatGPT, and it will not promise you first place. Without an API key, Benchline skips engine calls and still returns the crawl, the prompt pack, and the paste scorer.",
  },
  {
    question: "What does a Benchline report contain?",
    answer:
      "Readiness checks for robots rules, llms.txt, schema, and whether the title and H1 use the brand; a horizontal prompt pack of prompts a buyer might type; and a paste scorer that marks mention, position, list placement, and other names nearby in an answer you provide.",
  },
  {
    question: "Is the 0–100 score my rank in AI answers?",
    answer:
      "No. The citability score is a proxy built from pages we can fetch. It is not a share of voice, not a traffic estimate, and not a guarantee that any model will name you, let alone name you first.",
  },
] as const;

const samplePrompts = renderPromptPack("Northwind", "analytics").slice(0, 6);

async function PrefilledChecker({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  };
  return (
    <CheckerForm
      defaults={{
        brand: one("brand"),
        website: one("website"),
        category: one("category"),
      }}
    />
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const site = getSiteUrl();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Benchline",
              url: site,
              description: SITE_DESCRIPTION,
            },
            {
              "@type": "WebSite",
              name: "Benchline",
              url: site,
              description: SITE_DESCRIPTION,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: homeFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:py-20">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Free GEO checker
            </p>
            <h1 className="mt-3 max-w-xl text-4xl leading-[1.12] tracking-tight text-balance md:text-5xl">
              Benchline is a free GEO citability checker — see whether AI crawlers can cite your
              brand
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Benchline is a horizontal check for any brand. It scores citability on your site, gives
              you a prompt pack across the category, and grades an answer you paste in. It does not
              scrape ChatGPT, and it will not promise you first place.
            </p>
            <ul className="mt-6 space-y-2 text-sm leading-relaxed">
              <li>Citability proxy from 0 to 100, built from pages we can actually fetch.</li>
              <li>A lane of prompts: category demand, alternatives, brand, and evaluation.</li>
              <li>A paste scorer that runs in the browser, with no model call.</li>
            </ul>
          </div>
          <Suspense fallback={<CheckerForm />}>
            <PrefilledChecker searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl tracking-tight">What a report contains</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Readiness, not a rank",
              body: "Robots rules for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended, plus llms.txt, schema, and whether the title and H1 use the brand.",
            },
            {
              title: "A horizontal prompt pack",
              body: "About eighteen prompts a buyer might type, from “best {category} tools 2026” to “is {brand} worth it”. You run them. We do not pretend each free check queried every engine.",
            },
            {
              title: "Score the answer you have",
              body: "Paste a reply from ChatGPT, Perplexity, Gemini, or Claude. We mark the mention, its place in the text, list position, and other names nearby.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="methodology" className="border-y border-border bg-card/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-3xl tracking-tight">Honest limits</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Free live checks are limited. Without an API key, Benchline skips engine calls and
                still returns the crawl, the prompt pack, and the paste scorer.
              </p>
              <p>
                When a key is configured, a reply comes from that provider’s API. An API answer is not
                the consumer ChatGPT interface. Browsing, memory, and location change what a person
                sees.
              </p>
              <p>
                The score is a proxy. It is not a share of voice, not a traffic estimate, and not a
                guarantee that any model will name you, let alone name you first.
              </p>
            </div>
            <Link href="/methodology" className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4">
              Read the scoring table
            </Link>
          </div>
          <div>
            <h2 className="text-3xl tracking-tight">Example prompt lane</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Sample for a fictional brand, Northwind, in analytics. Your report uses the name and
              category you enter.
            </p>
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
              {samplePrompts.map((prompt) => (
                <li key={prompt.id} className="px-3 py-2 text-sm">
                  {prompt.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl tracking-tight">Guides</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Longer notes for people who publish and want answer engines to have something clean to
          cite. Each page includes the same checker.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <li key={guide.href} className="rounded-2xl border border-border bg-card p-5">
              <Link href={guide.href} className="font-heading text-xl underline-offset-4 hover:underline">
                {guide.title}
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guide.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-3xl tracking-tight">
          Questions
        </h2>
        <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {homeFaqs.map((faq) => (
            <details key={faq.question} className="group px-4 py-3">
              <summary className="cursor-pointer font-medium">{faq.question}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="waitlist" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl tracking-tight">Weekly tracking, later</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The free check is the product. Recurring tracking is a waitlist, not a checkout. There is
            no billing, no seat, and no email sent from this demo.
          </p>
          <div className="mt-5 max-w-3xl">
            <WaitlistForm source="/" />
          </div>
        </div>
      </section>
    </>
  );
}
