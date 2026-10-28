import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">404</p>
      <h1 className="mt-2 text-4xl tracking-tight">That page is not here</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The report id may be wrong, or the page was never published. Run a new check from the
        homepage.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-primary underline underline-offset-4">
        Back to the checker
      </Link>
    </div>
  );
}
