# Portfolio

Personal portfolio built with `Next.js` App Router and intended for Vercel deployment.

## Features
- Bold landing page focused on AI agents and `n8n` automation work
- Markdown-powered blog
- Contact form using a server action
- Guestbook with moderation-ready data shape
- Local JSON persistence for development

## Local development
```bash
npm install
npm run dev
```

## Environment notes
- `NEXT_PUBLIC_SITE_URL` is optional in local development and should be set in Vercel for correct production metadata URLs.
- For production on Vercel, replace the local JSON storage in `lib/storage.ts` with a persistent hosted store such as Vercel Postgres or KV.

## Content
- Profile data lives in `lib/site-data.ts`
- Blog posts live in `content/blog/*.md`
- Local interaction data is stored under `content/data/`

## Verification
```bash
npm run typecheck
npm run build
```
