export type Guide = {
  href: string;
  title: string;
  nav: string;
  description: string;
};

export const GUIDES: Guide[] = [
  {
    href: "/ai-visibility-checker",
    title: "Free AI visibility checker",
    nav: "AI visibility checker",
    description:
      "What a free AI visibility check can honestly say, and how citability differs from a mention in a chat answer.",
  },
  {
    href: "/geo-seo",
    title: "GEO and SEO, side by side",
    nav: "GEO and SEO",
    description:
      "Search rankings and answer-engine citations overlap, and they fail for different reasons.",
  },
  {
    href: "/does-chatgpt-mention-my-brand",
    title: "Does ChatGPT mention my brand?",
    nav: "ChatGPT mentions",
    description:
      "A practical way to look, why one screenshot is not a rank, and how to score the answer you already have.",
  },
  {
    href: "/free-geo-tools",
    title: "Free GEO tools you can use this week",
    nav: "Free GEO tools",
    description:
      "A map of free checks: citability crawls, prompt lists, paste scoring, and the paid suites we do not copy.",
  },
  {
    href: "/what-is-generative-engine-optimization",
    title: "What is generative engine optimization?",
    nav: "What is GEO",
    description:
      "A plain definition of GEO, what you can change on your site, and what no tool can promise.",
  },
  {
    href: "/llms-txt",
    title: "What is llms.txt?",
    nav: "llms.txt",
    description:
      "The community file at /llms.txt, what Benchline looks for, and a minimal example you can adapt.",
  },
  {
    href: "/ai-crawler-robots",
    title: "robots.txt for AI crawlers",
    nav: "AI crawler robots",
    description:
      "GPTBot, ClaudeBot, PerplexityBot, and Google-Extended, and how not to block ordinary search by accident.",
  },
  {
    href: "/how-ai-answers-pick-sources",
    title: "Sources AI answers often trust",
    nav: "Sources answers use",
    description:
      "The kinds of pages answer engines often repeat, with no fake frequency numbers.",
  },
];

export function relatedGuides(href: string, count = 3): Guide[] {
  const index = GUIDES.findIndex((guide) => guide.href === href);
  if (index === -1) return GUIDES.slice(0, count);
  const related: Guide[] = [];
  for (let step = 1; related.length < count && step < GUIDES.length; step += 1) {
    related.push(GUIDES[(index + step) % GUIDES.length]);
  }
  return related;
}
