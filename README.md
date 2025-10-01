# HomeTruth Styleguide & RAG Chat App

Production-grade Next.js app with a RAG knowledge base, chat UI, and ingestion tooling. Includes Pinecone integration, OpenAI Responses API streaming, URL/PDF scraping, and an opinionated Tailwind style system.

Links preserved from original v0 landing setup:
- Deployment: `https://vercel.com/jasonlryans-projects/v0-home-truth-landing-page`
- v0 project: `https://v0.app/chat/projects/Ghra9P9lVF7`

## Stack

- Next.js 15 (App Router), React 18
- Tailwind CSS 3, `@tailwindcss/typography`, `tailwindcss-animate`
- OpenAI Responses API via `openai` SDK
- Pinecone (integrated inference when available; classic vector upsert fallback)
- URL/PDF scraping via `@mozilla/readability`, `jsdom`, and optional headless `puppeteer`
- TypeScript, ESLint (disabled during build in `next.config.mjs`)

## App Structure

- `app/` Next.js routes (chat, dashboard, documents, onboarding, etc.)
- `components/` UI components, app layout, and shadcn-style primitives
- `lib/` OpenAI client, Pinecone service, prompt loading, utilities
- `scripts/` ingestion CLIs: `ingest-urls.ts`, `ingest-json.ts`
- `docs/` in-repo documentation (admin guide, API reference, setup & deployment)

## Quick Start

1) Install

```bash
npm install --legacy-peer-deps
```

2) Env vars (create `.env.local`)

```bash
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...

# Optional tuning
OPENAI_MODEL_CHAT=gpt-5
OPENAI_CHAT_TEMPERATURE=0.35
MAX_TOKENS=900
RAG_RETRIEVAL_TOPK=12
RAG_MAX_SOURCES=5
RAG_MAX_CONTEXT_CHARS=6000
PINECONE_NAMESPACE_DEFAULT=general
PINECONE_BATCH_DELAY_MS=12000
CHAT_MAX_INPUT_LENGTH=2000
CITATIONS_ON=true
```

3) Run dev server

```bash
npm run dev
```

## Available Scripts

- `npm run dev` – Start Next.js dev server
- `npm run build` – Build for production (TS/ESLint errors are ignored per `next.config.mjs`)
- `npm start` – Start production server
- `npm run ingest:urls` – Ingest from a markdown list of URLs (`info/urls.md` by default)
- `npm run ingest:urls:dry` – Dry-run URL ingestion with debug logs
- `npm run check:updates` – Utility script to check updates (see `scripts/`)

## Ingestion

### URLs

```bash
npx tsx scripts/ingest-urls.ts --file info/urls.md --namespace urls \
  --concurrency 3 --per-host 2 --timeout 15000 --report jsonl
```

Outputs JSONL/CSV reports in `reports/`. Uses integrated inference when available; otherwise embeds with `llama-text-embed-v2` and upserts vectors.

### JSON

```bash
npx tsx scripts/ingest-json.ts --file path/to/docs.json --namespace urls
```

Input format:

```json
{
  "metadata": { "focus": "topic-tag" },
  "documents": [
    { "id": "doc-1", "title": "Title", "content": "..." }
  ]
}
```

## Chat API

- Endpoint: `POST /api/chat`
- Body:

```json
{
  "message": "What should I check before making an offer?",
  "sessionId": "optional",
  "mode": "knowledge|user|hybrid",
  "filters": { "namespace": "general,urls", "category": ["Legal"], "tags": ["mortgage"] }
}
```

- Server-Sent Events stream returns `sources`, `token`, and `done` events. See `app/api/chat/route.ts`.

## Styling

- Tailwind configured in `tailwind.config.ts`; tokens defined in `app/globals.css`.
- Components use `primary/secondary` tokens; adjust brand in CSS variables.

## Deployment

- Vercel: `vercel.json` defines Next.js runtime and functions limits.
- Ensure environment variables are set in your Vercel project.

## Troubleshooting

- Missing tokens/sources: verify `PINECONE_API_KEY` and index names in `lib/pinecone.ts`.
- OpenAI errors: confirm `OPENAI_API_KEY` and model access.
- Styling: check `app/layout.tsx` imports and `app/globals.css` token definitions.

## Documentation

See `docs/` for detailed guides:
- `docs/knowledge-base-system.md`
- `docs/api-reference.md`
- `docs/setup-and-deployment.md`
- `docs/admin-user-guide.md`
