# 500 Internal Server Error Troubleshooting

## 1. Description
- **증상**: 배포된 사이트에서 블로그 포스트 클릭 시 `Internal server error (500)` 발생.
- **원인**: `astro.config.mjs`에서 `output: 'server'` (SSR) 모드를 사용 중일 때, 다이내믹 라우트(`[...slug].astro`)에서 `getStaticPaths`를 사용하면 온디맨드 렌더링 시 `Astro.props`가 비어있게 되어 렌더링에 실패함.
- **해결책**:
    - 해당 페이지 하단 혹은 상단에 `export const prerender = true;`를 추가하여 정적 페이지로 생성하도록 강제함.
    - 정적 블로그 포스트는 빌드 타임에 생성되므로 SSR 환경에서도 안전하게 로컬 데이터를 사용할 수 있음.

```astro
---
export const prerender = true;
// ... props 및 render 로직
---
```
