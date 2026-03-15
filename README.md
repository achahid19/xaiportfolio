# Portfolio

Personal portfolio built with `Next.js` App Router and intended for Vercel deployment.

## Features
- Bold landing page focused on AI agents and `n8n` automation work
- Markdown-powered blog
- Contact form using a server action with structured HTML email delivery
- Guestbook with moderation-ready data shape
- Local JSON persistence for development

## Local development
```bash
npm install
npm run dev
```

## Environment notes
- `NEXT_PUBLIC_SITE_URL` is optional in local development and should be set in Vercel for correct production metadata URLs.
- Connect a Vercel Blob store for production persistence. This provides `BLOB_READ_WRITE_TOKEN`, which the app uses for guestbook entries and contact submission backups on Vercel.
- Set `ADMIN_PASSWORD` in Vercel to enable the protected `/admin/guestbook` moderation page.
- Configure SMTP in Vercel to send contact submissions to `anasks1999@gmail.com`:
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=465`
  - `SMTP_SECURE=true`
  - `SMTP_USER=anasks1999@gmail.com`
  - `SMTP_PASS=<your Gmail app password>`
  - `CONTACT_TO_EMAIL=anasks1999@gmail.com`
- Local JSON storage in `lib/storage.ts` is still used in development.
- On Vercel, guestbook entries and contact submission backups use Vercel Blob automatically when `BLOB_READ_WRITE_TOKEN` is available.

## Content
- Profile data lives in `lib/site-data.ts`
- Blog posts live in `content/blog/*.md`
- Local interaction data is stored under `content/data/`

## Verification
```bash
npm run typecheck
npm run build
```
