# Implementation Log

## 2026-03-14 15:27 Africa/Casablanca
- Created the documentation baseline in `docs/`.
- Saved the approved portfolio build plan.
- Started implementation from an empty repository.
- Checks run: `ls -la`, `node -v`, `npm -v`
- Outstanding: scaffold the `Next.js` app, install dependencies, and build the content/data layer.

## 2026-03-14 15:34 Africa/Casablanca
- Installed project dependencies and dev dependencies with a repo-local npm cache to avoid permission conflicts outside the workspace.
- Added the `Next.js` App Router structure, shared styles, profile/project content models, and a Markdown blog loader.
- Implemented contact and guestbook server actions with local JSON-backed persistence for development.
- Added starter content for one blog post and seeded the guestbook.
- Checks run: `npm install ... --cache .npm-cache`, `npm install -D ... --cache .npm-cache`
- Outstanding: run production verification and clean up build issues.

## 2026-03-14 15:39 Africa/Casablanca
- Removed remote Google font fetching so the app builds cleanly in restricted environments and on Vercel without relying on runtime font downloads.
- Added `NEXT_PUBLIC_SITE_URL` documentation and moved metadata URL configuration to environment-driven defaults.
- Updated the typecheck workflow to generate Next route types before running `tsc`.
- Checks run: `npm run build`, `npx next typegen --help`
- Outstanding: rerun final verification and confirm the generated routes build cleanly after the script update.

## 2026-03-14 15:42 Africa/Casablanca
- Added a dedicated `tsconfig.typecheck.json` so standalone type-checking does not depend on the unstable set of generated `.next` type artifacts.
- Kept `next build` as the production verification path while making `npm run typecheck` deterministic from a clean checkout.
- Checks run: `npm run typecheck`, `npm run build`
- Outstanding: none after final verification if both commands pass on the updated script.

## 2026-03-14 15:47 Africa/Casablanca
- Copied the provided portrait into `public/images/portrait.png` from the Downloads folder.
- Added the portrait to the homepage hero as a dedicated visual card in the right-hand column.
- Checks run: asset copy from Downloads into `public/images/`
- Outstanding: rerun app verification after the UI update.

## 2026-03-14 15:49 Africa/Casablanca
- Re-ran verification after adding the portrait asset and hero layout updates.
- Confirmed the homepage, blog, contact, and guestbook routes still build successfully.
- Checks run: `npm run typecheck`, `npm run build`
- Outstanding: none for the portrait integration.

## 2026-03-14 15:55 Africa/Casablanca
- Reorganized the homepage into a clearer navigation flow with section anchors for about, projects, writing, and contact.
- Added a quick-jump strip, stronger call-to-action routing, and hover-based card interactions to make browsing easier and more active.
- Updated the header to prioritize section navigation and keep the guestbook accessible as a persistent CTA.
- Outstanding: run a final verification pass after the front-page restructuring.

## 2026-03-14 15:56 Africa/Casablanca
- Verified the homepage reorganization and interaction updates with a clean typecheck and production build.
- Confirmed the section-anchor navigation changes did not affect the existing blog, contact, or guestbook routes.
- Checks run: `npm run typecheck`, `npm run build`
- Outstanding: none for the front-page reorganization.

## 2026-03-14 16:02 Africa/Casablanca
- Corrected the hero layout structure so the main introduction no longer drops below the portrait stack.
- Fixed the header CTA text color collision caused by the generic nav link rule.
- Adjusted the portrait image framing to preserve more of the top of the head with a top-focused crop and taller frame.
- Outstanding: run verification after the UI corrections.

## 2026-03-14 16:03 Africa/Casablanca
- Verified the corrected hero structure, CTA styling, and portrait framing with a clean typecheck and production build.
- Confirmed the homepage and supporting routes still prerender correctly after the shared CSS changes.
- Checks run: `npm run typecheck`, `npm run build`
- Outstanding: none for the current UI correction pass.

## 2026-03-14 16:14 Africa/Casablanca
- Reworked the header into a proper responsive navigation with a mobile toggle instead of relying on wrapped links.
- Simplified the hero hierarchy by removing the duplicate quick-jump strip and consolidating support content into a cleaner intro structure.
- Added keyboard-visible focus states and tuned portrait sizing to rely on viewport bounds rather than oversized fixed heights.
- Avoided presenting placeholder social URLs as real CTAs by falling back to the contact route when profile links are not configured.
- Checks run: `npm run typecheck`, `npm run build`
- Outstanding: replace placeholder profile identity data with your real name and links for a fully production-ready presentation.

## 2026-03-14 16:19 Africa/Casablanca
- Reduced the visual weight of the portrait column by narrowing the hero side rail and capping the portrait frame height.
- Tightened the overall container width and section spacing so cards align on a cleaner rhythm across the homepage.
- Adjusted section header alignment and copy width so the containers read more deliberately instead of feeling loosely distributed.
- Checks run: `npm run typecheck`, `npm run build`
- Outstanding: real content replacement is still the main remaining professionalism gap.

## 2026-03-14 16:24 Africa/Casablanca
- Removed a real hydration-risk source in the guestbook by replacing locale-dependent `toLocaleDateString()` rendering with a fixed UTC formatter.
- Reviewed the reported hydration screenshot and noted that the shown `data-h-*` image attributes are consistent with browser-extension DOM mutation, which is external to the app code.
- Outstanding: verify the app in a clean browser profile if the image-tag hydration warning persists on the homepage.

## 2026-03-14 16:45 Africa/Casablanca
- Added an ambient connected-node background layer behind the site shell to introduce a more technical systems feel inspired by workflow graphs.
- Used softly animated SVG links and node pulses so the background reads as automation/network infrastructure without overwhelming the foreground content.
- Added reduced-motion handling so the effect remains accessible.
- Outstanding: verify the visual balance in the browser and tune density if it feels too busy.

## 2026-03-14 16:28 Africa/Casablanca
- Isolated the portrait into a client-mounted component so the homepage no longer hydrates a server-rendered image node that may be mutated by extensions before React attaches.
- Added a lightweight placeholder surface so the portrait frame keeps its layout during the first paint.
- Outstanding: rerun verification and confirm the portrait-related hydration warning is gone in the normal browser session.

## 2026-03-14 17:15 Africa/Casablanca
- Added a persisted light/dark theme system with an inline pre-hydration initializer and a header toggle for switching modes.
- Reworked the global palette to be less noisy, especially in the background and ambient network, while keeping the automation aesthetic intact.
- Moved key UI surfaces and the ambient workflow layer onto theme-aware variables so both light and dark modes feel intentionally designed.
- Checks run: `npm run typecheck`, `npm run build`
- Outstanding: visual review in both modes to decide whether the dark theme should stay neutral or shift slightly warmer.

## 2026-03-14 17:32 Africa/Casablanca
- Fixed the remaining dark-mode color regressions caused by shared components still using light-only surface values.
- Added dedicated theme tokens for strong cards, chips, highlights, notes, form fields, mobile navigation panels, code blocks, portrait overlays, and focus rings, then rewired the affected components to use them.
- This specifically corrected the low-contrast project cards in dark mode where light surfaces and light text were colliding.
- Checks run: `npm run typecheck`, `npm run build`
- Outstanding: do a final browser-side sweep for page-specific content colors beyond the shared theme layer.
