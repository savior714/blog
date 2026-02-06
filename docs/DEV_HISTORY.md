# DEV_HISTORY.md

## 2026-02-07
- **Astro 블로그 초기화**: Astro 5 및 Tailwind CSS 4 템플릿 기반 프로젝트 생성.
- **디자인 고도화**: 오프화이트 배경(#fcfcfc) 및 시스템 폰트 적용, `prose` (Typography) 스타일링.
- **500 에러 수정**: SSR 모드에서 블로그 포스트의 `getStaticPaths`가 무시되어 발생하는 500 에러를 `prerender = true` 설정으로 해결.
- **Web-based Writing Studio 최종 통합**: 브라우저에서 직접 글을 쓰고 로컬 파일로 저장하는 `/write` 페이지와 헤더 링크 구현 완료. 원장님의 로컬 워크플로우에 최적화됨.
- **Local Post Scaffolder 유지**: CLI 선호 시 사용 가능한 `npm run new-post` 도구 병행 운영.
- **Vercel 설정 안정화**: `vercel.json`을 통해 Astro 프레임워크 기반 배포가 안정적으로 이루어지도록 최종 점검 완료.
- **거버넌스 수립**: `docs/AGENTS.md` 작성을 통한 AI 협업 가이드라인 확립.
- **Vercel 연동**: `@astrojs/vercel` 어댑터 추가 및 GitHub 저장소 동기화.
