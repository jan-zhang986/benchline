import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-heading text-lg">Benchline</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A free, horizontal GEO checker. Citability is a proxy from your own pages. It is not a
            guarantee of placement in any AI answer.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Guides</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {GUIDES.map((guide) => (
              <li key={guide.href}>
                <Link href={guide.href} className="text-foreground/80 underline-offset-4 hover:underline">
                  {guide.nav}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <Link href="/methodology" className="text-foreground/80 underline-offset-4 hover:underline">
                Methodology
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-foreground/80 underline-offset-4 hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-foreground/80 underline-offset-4 hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="text-foreground/80 underline-offset-4 hover:underline">
                Sitemap
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
