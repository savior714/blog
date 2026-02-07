# DEV_HISTORY.md

## 2026-02-07
- **Astro 블로그 초기화**: Astro 5 및 Tailwind CSS 4 템플릿 기반 프로젝트 생성.
- **디자인 고도화**: 오프화이트 배경(#fcfcfc) 및 시스템 폰트 적용, `prose` (Typography) 스타일링.
- **500 에러 수정**: SSR 모드에서 블로그 포스트의 `getStaticPaths`가 무시되어 발생하는 500 에러를 `prerender = true` 설정으로 해결.
- **Vercel MCP 연동 완료**: `@nganiet/mcp-vercel` 서버를 Antigravity 설정에 등록하여 배포 모니터링 및 로그 분석 기능 강화.
- **CMS 최종 의사결정**: 커스텀 에디터를 폐기하고 Keystatic CMS와 로컬 CLI 도구(`new-post`) 병행 체제로 확정.
- **Header 내비게이션 최적화**: 미니멀리즘을 위해 'Write' 링크 제거 및 핵심 메뉴 구성.
- **500 렌더링 에러 해결**: Vercel SSR 환경에서 블로그 포스트의 prerender 설정을 통해 안정성 확보.
- **로컬 스캐폴더 고도화**: 마크다운 생성 시 내용 입력 및 VS Code 자동 열기 기능 추가.
- **거버넌스 수립**: `docs/AGENTS.md` 작성을 통한 AI 협업 가이드라인 확립.
- **Vercel 연동**: `@astrojs/vercel` 어댑터 추가 및 GitHub 저장소 동기화.
