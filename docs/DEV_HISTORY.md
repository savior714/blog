# DEV_HISTORY.md

## 2026-02-07
- **Astro 블로그 초기화**: Astro 5 및 Tailwind CSS 4 템플릿 기반 프로젝트 생성.
- **디자인 고도화**: 오프화이트 배경(#fcfcfc) 및 시스템 폰트 적용, `prose` (Typography) 스타일링.
- **500 에러 수정**: SSR 모드에서 블로그 포스트의 `getStaticPaths`가 무시되어 발생하는 500 에러를 `prerender = true` 설정으로 해결.
- **Local Post Scaffolder 구현**: `npm run new-post` 명령어를 통해 터미널에서 즉시 마크다운 글을 생성하는 CLI 스크립트(`scripts/new-post.mjs`) 도입.
- **Keystatic CMS 복구 및 병행**: 사용자 요청에 따라 Keystatic CMS를 다시 활성화하고, 로컬 마크다운 작성 방식과 병행 가능하도록 구성.
- **Vercel 설정 유지**: `vercel.json`을 통해 Astro 프레임워크 기반 배포가 안정적으로 이루어지도록 고정.
- **거버넌스 수립**: `docs/AGENTS.md` 작성을 통한 AI 협업 가이드라인 확립.
- **Vercel 연동**: `@astrojs/vercel` 어댑터 추가 및 GitHub 저장소 동기화.
