import type { Metadata } from "next";
import Link from "next/link";

const CONTACT_EMAIL = "jan.zhang986@gmail.com";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the operator of Benchline for questions, feedback, or data requests.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl tracking-tight">Contact</h1>
      <div className="article-copy">
        <p>
          Benchline is maintained as an open checker project. For questions about a report you ran,
          feedback on the tool, waitlist or deletion requests, or press and partnership notes, email
          the operator directly.
        </p>
        <h2>Email</h2>
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p>
          Please include the report URL (for example <code>/r/{"{id}"}</code>) if your message is
          about a specific check. Benchline does not offer phone support or a physical mailing
          address through this site.
        </p>
        <h2>Response time</h2>
        <p>
          This is a small project without a support desk. You may not get an instant reply. For
          product behavior and limits, the on-site{" "}
          <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy</Link> pages describe
          what the application stores and how public reports work.
        </p>
        <p>
          <Link href="/about">About</Link>
          {" · "}
          <Link href="/methodology">Methodology</Link>
        </p>
      </div>
    </article>
  );
}