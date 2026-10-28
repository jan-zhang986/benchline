import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Benchline stores when you run a citability check or join the waitlist.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl tracking-tight">Privacy</h1>
      <div className="article-copy">
        <p>
          Benchline is a software project. The operator is whoever deploys this instance. This page
          describes the data the application handles. It is not a law-firm policy for a named
          company.
        </p>
        <h2>Checks and public reports</h2>
        <p>
          A check stores the brand, the website URL, the optional category, the crawl findings, the
          rendered prompts, any optional live API excerpt, and the time. The report is public at
          /r/{"{id}"} and may be indexed. Do not submit a host, a path, or a brand string you would
          not put on a public page.
        </p>
        <p>
          The crawl requests the homepage, /robots.txt, and /llms.txt. It does not log into your
          site and it does not store the raw HTML.
        </p>
        <h2>Rate limits</h2>
        <p>
          The server hashes the caller IP with a salt and counts requests. The raw IP is not written
          to the report. The hash is for abuse control.
        </p>
        <h2>Paste scorer</h2>
        <p>
          Pasted answers are scored in the browser. They are not sent to the server by the paste
          form. If you paste them into some other tool, that is a separate choice.
        </p>
        <h2>Waitlist</h2>
        <p>
          The waitlist stores an email address, an optional brand, a source path, and a time. This
          demo does not send mail. To ask for deletion, contact the operator of the deployment you
          used. There is no account system to log into.
        </p>
        <h2>Optional live APIs</h2>
        <p>
          If the operator sets a DataForSEO, OpenAI, or Brave key, one short prompt derived from the
          brand and URL may be sent to that provider, then cached for seven days. The provider’s own
          terms apply to that call.
        </p>
        <h2>Advertising</h2>
        <p>
          Ad slots are placeholders until an AdSense client id is configured. If the operator
          enables AdSense, Google may set cookies under Google’s policy. The results of a check are
          never labeled as a sponsored brand.
        </p>
        <h2>Bot check</h2>
        <p>
          If a Cloudflare Turnstile secret is configured, the check form sends a token to Cloudflare
          for verification. Without that secret, only the IP rate limit applies.
        </p>
        <p>
          <Link href="/terms">Terms</Link>
        </p>
      </div>
    </article>
  );
}
