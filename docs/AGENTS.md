# 🤖 Project Master Instruction (AGENTS.md)

## 🎯 1. Project Overview & Control

- **핵심 목표:** Next.js 및 Tailwind CSS를 활용한 고품질의 개인 기술 블로그 구축 및 지속적인 운영/관리.
- **기술 스택:**
  - **Web:** Next.js (App Router), React, Typescript.
  - **UI/UX:** Tailwind CSS, Contentlayer (MDX 관리).
  - **Decoration:** Lucide React (Icons), Giscus (Comments).
  - **Environment:** Node.js (npm).

- **운영 명령어:**
  - 개발 실행: `npm run dev`
  - 빌드: `npm run build`
  - 린트: `npm run lint`

## 🏗 2. 개발 및 소통 원칙 (Core Principles)

1. **언어 정책:** 모든 답변과 산출물(Artifacts)은 반드시 **한글**로 작성한다.
2. **Next.js 우선:** 웹페이지 개발은 반드시 Next.js (App Router)를 기반으로 하며, 서버 컴포넌트를 우선 활용한다.
3. **간결성(Conciseness):** 불필요한 설명은 최소화하고 작업 결과와 핵심 로그 위주로 보고한다.
4. **정직성(Honesty):** 모르는 내용이나 에러 발생 시 추측하지 않고 솔직히 인정하며 대안을 제시한다.
5. **인코딩:** 모든 소스 코드 및 입출력의 한국어 문자는 반드시 **UTF-8**로 인코딩한다.
6. **문서 관리:** 모든 Markdown 파일은 프로젝트 루트의 **`docs/` 폴더** 안에 저장한다.

## 🤖 3. Git Push Workflow (5단계 필수 절차)

"git에 푸시해줘" 요청 시 다음 절차를 엄격히 준수한다.

1. **변경사항 정리 및 커밋:** `git status` 확인 후 논리적 단위로 스테이징. Conventional Commits (feat:, fix:, docs:) 규격 준수 및 UTF-8 메시지 작성.
2. **문서 업데이트:** `README.md` 또는 `docs/AGENTS.md`에 변경 사항을 즉시 반영 후 커밋.
3. **Feature 브랜치 푸시:** 현재 브랜치를 원격 저장소에 push.
4. **Main 브랜치 병합:** main 브랜치로 체크아웃 후 merge 실행. 충돌 시 즉시 보고 및 해결책 제시.
5. **Main 브랜치 최종 푸시:** 병합 완료된 main 브랜치를 `origin main`에 최종 push.

## 🛠 4. 세부 구현 및 유지보수 지침 (Detailed Rules)

- **Design & UI:**
  - Tailwind CSS를 기반으로 하되, 가독성과 심미성을 고려한 디자인을 적용한다.
  - 다크 모드를 완벽하게 지원해야 한다.

- **Content Management:**
  - 블로그 포스트는 `data/blog` 디렉토리에 `.mdx` 형식으로 작성한다.
  - Frontmatter(제목, 날짜, 태그 등)를 빠짐없이 작성한다.

- **Code Quality & Refactoring:**
  - **Tidying:** 리팩토링 시 기존 기능에 문제를 일으키지 않도록 작은 변화부터 시작한다.
  - 주기적으로 `npm run lint`를 통해 코드 품질을 점검한다.

- **Error Handling:**
  - 모든 에러 메시지를 무시하지 말고 분석하며, 해결 코드를 반드시 포함한다.

- **Conflict Management:**
  - 실제 코드와 이 지침(`docs/AGENTS.md`)이 충돌하면 지침을 최신화하는 것을 최우선으로 제안한다.
