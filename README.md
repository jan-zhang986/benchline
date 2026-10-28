# Benchline

Benchline is a free, horizontal GEO (generative engine optimization) checker. You enter a brand and a website. It crawls citability signals, builds a prompt pack across the category, and lets you score an AI answer you paste in. Reports live at a public URL (`/r/{id}`).

It is not a multi-engine share-of-voice product. It does not scrape the ChatGPT, Claude, Perplexity, or Gemini websites.

## What a check actually does

1. Fetches the homepage, `/robots.txt`, and `/llms.txt` (single pages, user-requested).
2. Scores a citability proxy from 0 to 100:
   - GPTBot, ClaudeBot, PerplexityBot, and Google-Extended are not blocked
   - a plain-text `/llms.txt` exists
   - Organization, WebSite, and FAQ schema
   - title and H1 include the brand, plus meta description, HTTPS, and a canonical link
3. Renders a horizontal prompt pack (category, alternatives, brand, evaluation). Edit `lib/prompt-pack.ts`. Saved reports keep the prompts from check time.
4. Offers a paste scorer in the browser. Nothing in that box is uploaded.
5. Optionally calls one provider API if you configured a key. Otherwise that section says it was skipped.

Point values are on `/methodology`.

## Honest limits

- The score is a proxy from pages we fetched. It is not a rank in any answer engine.
- Free checks do not query every engine. Live calls are optional, quota-capped, and cached for seven days.
- An API reply is not the consumer ChatGPT (or Claude, Perplexity, or Gemini) interface. Models, browsing, memory, and location differ.
- Benchline never promises a placement, including first place.
- The product does not invent traffic, citation rates, or ad costs.
- Weekly tracking is a waitlist. There is no billing, no accounts, and no email sender in this version.
- Pasted “competitor” names are guesses from lists and “vs” phrases, plus names you type. Guesses can be wrong.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm test
npm run dev -- --port 3847
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847). Submit a public brand and URL. The report reloads at `/r/{id}`.

```bash
npm run build
npm start -- --port 3847
```

SQLite is created at `data/benchline.db` on first check (gitignored). No API key is required.

## Environment

Copy `.env.example` to `.env.local`. All variables are optional for the demo.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for sitemap, robots, and Open Graph. Set this in production. |
| `TURSO_DATABASE_URL` | libSQL / Turso URL. When unset, a local SQLite file is used. |
| `TURSO_AUTH_TOKEN` | Turso token. Omit for the local file. |
| `RATE_LIMIT_SALT` | Salt for hashed IP buckets. Defaults to a dev salt. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile. If the secret is unset, only the IP limit applies (8 checks/hour, 30/day). |
| `NEXT_PUBLIC_ADSENSE_CLIENT` and slot ids | Real AdSense units. Until set, slots render as labeled placeholders. |
| `LIVE_CHECKS` | Set to `off` to skip provider calls even when keys exist. |
| `LIVE_CHECK_DAILY_QUOTA` | Global cap on live calls per UTC day. Default 15. Cache hits do not count. |
| `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` | [DataForSEO ChatGPT LLM Responses](https://docs.dataforseo.com/v3/ai_optimization/chat_gpt/llm_responses/live/). |
| `DATAFORSEO_MODEL` | Default `gpt-4.1-mini`. |
| `DATAFORSEO_WEB_SEARCH` | `true` enables web search on that call (costs more). Default off. |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI Chat Completions. Not the ChatGPT app. |
| `BRAVE_API_KEY` or `BRAVE_SEARCH_API_KEY` | [Brave AI Answers](https://api.search.brave.com/res/v1/chat/completions). |

At most three providers run, in this order when configured: DataForSEO, OpenAI, Brave. Each report uses one short prompt per provider.

## Deploy on Vercel

The app is a Next.js App Router project.

1. Import the Git repository in Vercel, or run the Vercel CLI from this directory.
2. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
3. Create a [Turso](https://turso.tech) database and set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

A local SQLite file does not persist on Vercel serverless. If Turso is unset, the app falls back to `file:/tmp/benchline.db`, which disappears between instances. Reports will not stay shareable until Turso (or another libSQL URL) is configured.

`npm run build` does not need paid API keys.

### GitHub Actions (CLI deploy)

Pushes to `main` (and manual **workflow_dispatch**) run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow uses the Vercel CLI only — no Vercel GitHub App. Application secrets (`TURSO_*`, API keys, and so on) stay in the Vercel project; do not copy them into GitHub.

Add these **repository secrets** in GitHub (**Settings → Secrets and variables → Actions**):

| Secret | Expected value |
| --- | --- |
| `VERCEL_TOKEN` | A Vercel account token with access to the team and project ([Vercel account tokens](https://vercel.com/account/tokens)). |
| `VERCEL_ORG_ID` | `team_4nkNRgv9n8HvRXaLT72Y59gd` (team slug `benchline2`) |
| `VERCEL_PROJECT_ID` | `prj_iyPZ03SU3mnWe66OxH0sOXa6IuoI` (project name `benchline`) |

Production URL: [https://benchline-benchline2.vercel.app](https://benchline-benchline2.vercel.app).

### Origin and Vercel

This project may be hosted on Origin. Vercel deploys from a Git connection it can read. If the canonical remote is Origin, connect the GitHub repository Vercel is allowed to import (an Origin mirror, if that is how the project is published) or deploy with the Vercel CLI from a checkout of this branch. Use the same environment variables in the Vercel project as in `.env.example`. Activating a Vercel project does not turn on billing inside Benchline.

## Abuse controls

- IP buckets, hashed, 8 checks per hour and 30 per day.
- Honeypot field on the check and waitlist forms.
- Turnstile verification when `TURNSTILE_SECRET_KEY` is set.
- Public-URL check before fetch: http(s) only, ports 80/443, private and link-local addresses refused, redirects rechecked. This is a basic guard, not a full SSRF sandbox.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm test` — unit tests for robots parsing, the paste scorer, and the score table
- `npm run lint` — ESLint
