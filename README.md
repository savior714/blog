# Savior Lab Notes

Case-based blog for Vibe Coding, Local AI, and Local LLM workflows.

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content Structure

- Data source: `src/lib/cases.ts`
- List page: `/case`
- Detail page: `/case/[slug]`
- Thumbnails: `public/cases/*.svg`

## No-Video Writing Flow

Use this when a post is ready before YouTube is uploaded.

1. Add a new post object to `casePosts` in `src/lib/cases.ts`.
2. Keep post ordering stable (`#1`, `#2`, `#3` is based on array order).
3. Leave `youtubeUrl` empty (or omit it entirely).
4. Add `thumbnail` with a content-based SVG path (for example, `/cases/my-post.svg`).
5. Create the SVG in `public/cases/` with title/keywords from the article.

Behavior:

- If `thumbnail` exists, it is shown on home/list/detail.
- If `youtubeUrl` is missing, detail page shows `영상 링크 준비 중`.
- If `thumbnail` is also missing, fallback generated thumbnail UI is used.

## Pre-Deploy Check

```bash
npm run lint
npm run build
```
