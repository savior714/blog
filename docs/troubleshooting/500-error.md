# 500 Internal Server Error Troubleshooting

## 1. Description
- **Symptom**: `Internal server error (500)` occurs when clicking a blog post on the deployed site.
- **Cause**: When using `output: 'server'` (SSR) mode in `astro.config.mjs`, dynamic routes (`[...slug].astro`) using `getStaticPaths` result in empty `Astro.props` during on-demand rendering, causing failure.
- **Solution**:
    - Force static page generation by adding `export const prerender = true;` to the top or bottom of the affected file.
    - Since static blog posts are generated at build time, local data can be safely used even in an SSR environment.

```astro
---
export const prerender = true;
// ... props and render logic
---
```
