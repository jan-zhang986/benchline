import { getSiteUrl, SITE_DESCRIPTION } from "@/lib/site";

function buildLlmsTxt(): string {
  const site = getSiteUrl();
  return `# Benchline

> ${SITE_DESCRIPTION}

Benchline is a free, horizontal GEO (generative engine optimization) checker for any brand and website. It fetches the homepage, /robots.txt, and /llms.txt, scores citability signals, builds a category prompt pack, and grades an answer you paste in the browser. Shareable reports live at \`/r/{id}\`. Benchline does not scrape consumer ChatGPT and never promises a number-one placement.

## Canonical pages

- [Home](${site}/)
- [Methodology](${site}/methodology)
- [What is llms.txt?](${site}/llms-txt)
- [What is generative engine optimization?](${site}/what-is-generative-engine-optimization)
- [Free AI visibility checker](${site}/ai-visibility-checker)
- [Free GEO tools](${site}/free-geo-tools)

## Site

${site}
`;
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
