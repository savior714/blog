# DEV_HISTORY.md

## 2026-02-07
- **Astro Blog Initialization**: Created project based on Astro 5 and Tailwind CSS 4 templates.
- **Design Enhancement**: Applied off-white background (#fcfcfc), system fonts, and `prose` (Typography) styling.
- **500 Error Fix**: Resolved 500 errors caused by `getStaticPaths` being ignored in SSR mode by setting `prerender = true`.
- **Vercel MCP Integration**: Registered `@nganiet/mcp-vercel` server to Antigravity settings to enhance deployment monitoring and log analysis.
- **CMS Final Decision**: Deprecated custom editor and finalized a hybrid system of Keystatic CMS and local CLI tool (`new-post`).
- **Header Navigation Optimization**: Removed 'Write' link for minimalism and organized core menu.
- **500 Rendering Stability**: Ensured stability in Vercel SSR environment via prerender settings on blog posts.
- **Local Scaffolder Refinement**: Added content input and auto-open in VS Code for the markdown generator.
- **Governance Setup**: Established AI collaboration guidelines via `docs/AGENTS.md`.
- **Vercel Integration**: Added `@astrojs/vercel` adapter and synchronized GitHub repository.
