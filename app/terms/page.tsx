import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the Benchline citability checker.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl tracking-tight">Terms</h1>
      <div className="article-copy">
        <p>
          Benchline is a free checker. By running a check you agree that the report page is public.
          The software is provided as-is, without a warranty that a score, a crawl, or a pasted-text
          reading is complete or correct.
        </p>
        <h2>No rank promise</h2>
        <p>
          Scores are proxies from on-site signals and, when you paste text, from that text. They are
          not a rank in ChatGPT, Claude, Perplexity, Gemini, or any other product. Nothing on this
          site promises a placement, including first place. API replies, when the operator has
          enabled them, are not the consumer chat interface.
        </p>
        <h2>Your use</h2>
        <p>
          Do not use the checker to attack a site, to probe private networks, or to submit URLs you
          are not allowed to fetch. The server refuses non-public addresses, and that control is not
          a guarantee. Do not flood the form. Rate limits are part of the service.
        </p>
        <h2>No account, no payment</h2>
        <p>
          There is no customer account and no paid plan in this version. The weekly tracking form is
          a waitlist. Joining it does not create a contract for email, a report, or a future
          feature.
        </p>
        <h2>Content</h2>
        <p>
          You are responsible for the brand names and URLs you submit. Public reports may be copied
          by anyone with the link and may be indexed by search engines.
        </p>
        <p>
          <Link href="/privacy">Privacy</Link>
          {" · "}
          <Link href="/methodology">Methodology</Link>
        </p>
      </div>
    </article>
  );
}
