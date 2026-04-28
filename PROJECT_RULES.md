# Project Rules

## Navigation Stability Rules

- Internal route navigation must use `next/link`.
- External URLs (GitHub, YouTube, docs) must use `<a>` with `target="_blank"` and `rel="noreferrer"`.
- For user-facing "go back to main" actions, always provide an explicit `href="/"` link (do not rely only on browser back behavior).
- Keep route paths canonical and consistent:
  - Home: `/`
  - Case list: `/case`
  - Case detail: `/case/[slug]`
- Do not introduce unnecessary redirect chains between these routes.

## Routing QA Checklist (Before Deploy)

- Verify round-trip flows:
  - `/` -> `/case` -> `/` 
  - `/` -> `/case/[slug]` -> `/`
  - `/case/[slug]` -> `/case` -> `/`
- Confirm 404 behavior:
  - Invalid route shows custom `not-found` UI.
  - `404` page includes links to `/` and `/case`.
- Confirm scroll behavior:
  - Route change does not render blank/overlapped content.
  - Hash link behavior on home (`#featured`) remains stable.
- Run production build before deploy: `npm run build`.

## Change Safety

- When touching navigation, update both UI and this checklist if behavior changes.
- If a routing bug is found, add a reproduction path and fix summary to commit message.
