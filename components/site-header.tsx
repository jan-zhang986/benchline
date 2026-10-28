import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link href="/" className="mr-auto inline-flex items-center gap-2 text-lg">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            B
          </span>
          <span className="font-heading text-xl tracking-tight">Benchline</span>
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/#checker" className="text-foreground/80 hover:text-foreground">
            Check
          </Link>
          <Link href="/methodology" className="text-foreground/80 hover:text-foreground">
            Methodology
          </Link>
          <details className="relative">
            <summary className="cursor-pointer list-none text-foreground/80 hover:text-foreground [&::-webkit-details-marker]:hidden">
              Guides
            </summary>
            <div className="z-40 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-sm md:absolute md:right-0">
              {GUIDES.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="block rounded-lg px-2 py-1.5 text-sm text-foreground/85 hover:bg-muted"
                >
                  {guide.nav}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/#waitlist" className="font-medium text-primary hover:underline">
            Weekly tracking
          </Link>
        </nav>
      </div>
    </header>
  );
}
