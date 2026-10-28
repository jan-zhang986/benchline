import type { ReactNode } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { CheckerForm } from "@/components/checker-form";
import { JsonLd } from "@/components/json-ld";
import { relatedGuides, type Guide } from "@/lib/guides";

export type Faq = { question: string; answer: string };

export function GuideLayout({
  href,
  kicker,
  title,
  lede,
  intro,
  body,
  faqs,
}: {
  href: string;
  kicker: string;
  title: string;
  lede: string;
  intro: ReactNode;
  body: ReactNode;
  faqs: Faq[];
}) {
  const related = relatedGuides(href);
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">{kicker}</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight text-balance md:text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{lede}</p>
      <div className="article-copy">{intro}</div>
      <section className="mt-10" aria-labelledby="run-check">
        <h2 id="run-check" className="font-heading text-3xl tracking-tight">
          Run a free check
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Brand, website, and an optional category. You get a shareable report with a citability
          score, a prompt pack, and a paste scorer.
        </p>
        <div className="mt-4">
          <CheckerForm heading="Check a brand" />
        </div>
      </section>
      <div className="article-copy">{body}</div>
      <AdSlot placement="article" />
      <section className="mt-4" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-heading text-3xl tracking-tight">
          Questions
        </h2>
        <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-4 py-3">
              <summary className="cursor-pointer font-medium">{faq.question}</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-10" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-heading text-2xl tracking-tight">
          Related guides
        </h2>
        <ul className="mt-3 space-y-2">
          {related.map((guide: Guide) => (
            <li key={guide.href}>
              <Link href={guide.href} className="font-medium underline-offset-4 hover:underline">
                {guide.title}
              </Link>
              <p className="text-sm text-muted-foreground">{guide.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
