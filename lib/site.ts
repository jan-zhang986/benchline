export const SITE_NAME = "Benchline";

export const SITE_DESCRIPTION =
  "Free GEO citability checker. Score whether AI crawlers can read your site, get a horizontal prompt pack, and grade an answer you paste in. Not a ChatGPT rank.";

/** Public origin used for canonical URLs, sitemap, and robots.txt. */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      /* fall through */
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://127.0.0.1:3847";
}
