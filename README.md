# Savior Lab Notes

Case-based blog for Vibe Coding, Local AI, and Local LLM workflows.

## Local Development

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Content Structure

- Content collection: `src/content/cases/` (Markdown files with frontmatter)
- Collection schema: `src/content/config.ts`
- Types & utilities: `src/lib/cases.ts`
- List page: `/case`
- Detail page: `/case/[slug]`
- Thumbnails: `public/cases/*.svg`

## Writing a Post

Create a new Markdown file in `src/content/cases/` with frontmatter:

```yaml
---
tag: "Vibe Coding"
title: "Post Title"
summary: "Short summary for cards"
thumbnail: "/cases/post-slug.svg"
youtubeUrl: "https://youtube.com/..."
publishedAt: "2026-04-28"
---

Post content here...
```

Behavior:

- If `thumbnail` exists, it is shown on home/list/detail.
- If `youtubeUrl` is missing, detail page shows `영상 링크 준비 중`.
- If `thumbnail` is also missing, fallback generated thumbnail UI is used.

## Pre-Deploy Check

```bash
npm run lint
npm run build
```
