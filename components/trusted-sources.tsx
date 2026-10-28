import Link from "next/link";

const SOURCES = [
  {
    title: "The brand’s own docs and pricing",
    detail:
      "Specific pages that say what the product does, who it is for, and what it costs. Vague homepages are hard to quote.",
  },
  {
    title: "Comparison and alternatives pages",
    detail:
      "Pages that name more than one product and describe a real difference. Answer engines often repeat that shape.",
  },
  {
    title: "Practitioner threads",
    detail:
      "Public discussions on sites such as Reddit or Hacker News, where people say what they actually use.",
  },
  {
    title: "Review sites in the category",
    detail:
      "Established review pages that already compare vendors. Benchline does not measure whether you appear on them.",
  },
  {
    title: "Reference pages",
    detail:
      "Reference entries, such as Wikipedia, when a brand is notable enough to have one. Most brands will not.",
  },
  {
    title: "Primary sources",
    detail:
      "Standards, documentation, filings, and original data. Thin affiliate copy is a weak thing to cite.",
  },
];

export function TrustedSources() {
  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {SOURCES.map((source) => (
          <li key={source.title} className="rounded-xl border border-border bg-card p-4">
            <p className="font-medium">{source.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{source.detail}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        This list is a map of source types. It is not a measurement of your brand, and it does not
        include frequency or traffic numbers.{" "}
        <Link href="/how-ai-answers-pick-sources" className="underline underline-offset-4">
          Read the longer note
        </Link>
        .
      </p>
    </div>
  );
}
