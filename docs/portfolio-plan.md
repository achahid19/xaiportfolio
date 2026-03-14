# Portfolio Build + Documentation Workflow

## Summary
When execution is enabled, start by creating a minimal project structure that stores both the build plan and an ongoing implementation log inside the repo. The portfolio itself should be built as a `Next.js` app for Vercel, with your profile positioned around AI agents and `n8n` automation, plus a blog-ready content system, contact form, and guestbook.

## Key Changes
- Create repo documentation artifacts first:
  - `docs/portfolio-plan.md` containing the approved build plan
  - `docs/implementation-log.md` capturing dated progress entries, decisions, blockers, and verification notes
- Bootstrap the app as a Vercel-ready `Next.js` project with:
  - App Router
  - content folder for Markdown blog posts
  - reusable data/content layer for profile and projects
  - deploy config and environment variable documentation
- Implement the site in this order:
  - Content foundation: your profile data, current focus, social links, and starter projects
  - Core pages/sections: hero, about/currently doing, featured projects, blog index, contact, guestbook
  - Interaction features: contact submission flow and guestbook submission/display with moderation-ready data model
  - SEO and production readiness: metadata, social cards, responsive behavior, and Vercel deployment setup
- Log implementation continuously:
  - one entry per meaningful milestone
  - include what changed, why, files touched, checks run, and outstanding issues
  - final entry summarizes deployment readiness and next steps

## Public Interfaces / Content Shapes
- `profile`:
  - `name`, `headline`, `shortBio`, `longBio`, `currentFocus`, `skills`, `tools`, `socialLinks`
- `project`:
  - `title`, `slug`, `summary`, `stack`, `role`, `links`, `featured`, `coverImage`
- `blogPost` frontmatter:
  - `title`, `slug`, `date`, `excerpt`, `tags`, `coverImage`, `published`
- `contactSubmission`:
  - `name`, `email`, `message`, `submittedAt`
- `guestbookEntry`:
  - `name`, `message`, `createdAt`, `approved`

## Test Plan
- Verify project boots locally and builds successfully for Vercel.
- Test all main routes and responsive layouts.
- Add one sample Markdown post and verify blog listing/post rendering.
- Test valid and invalid contact submissions.
- Test guestbook submission flow and approved-only rendering.
- Confirm docs are updated:
  - plan file created once
  - implementation log updated after each milestone

## Assumptions And Defaults
- Save planning and implementation logs under `docs/`.
- Use `Next.js` as the framework and Vercel as the deployment target.
- Use Markdown-in-repo for blog authoring.
- Use contact form + guestbook for v1, not full per-post comments.
- Because the workspace is currently empty, implementation should begin from project bootstrap rather than adaptation of an existing app.
