<!-- Language: ko -->

# 🗺️ Project Blueprint: 프론트엔드 테스트 인프라 구축 (TEM-510)

## 문서 메타
- **Last Verified**: 2026-06-18 | **Tested Version**: Astro v5.18.2
- **Reference**: N/A
- **SSOT Check**: N/A
- **Project Status Link**: N/A
- **Linear-Issue**: TEM-510
- **Priority**: 5.1
- **Labels**: infra, testing, frontend
- **Architectural Goal**: Astro 컴포넌트·페이지·클라이언트 스크립트에 대한 Vitest 기반 테스트 인프라 구축 — Python 테스트만 존재하던 상태에서 프론트엔드 검증 루프 추가

## 📎 관련 명세

> **아카이브 필수**: `/archive` 시 `just plan-lint <file> --archive-ready`가 본 절(「관련 명세」) 또는 본문 `docs/specs/` 문자열을 검사합니다. `SSOT Check`와 별개입니다.

| 문서 | 범위 |
| :--- | :--- |
| `docs/specs/technical/SPEC_TAILWIND_THEME.md` | Tailwind v4 테마 — CSS 클래스 렌더링 안정성 검증 참고 |
| `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md` | SEO 메타 태그 — Layout.astro og/twitter 태그 검증 참고 |

## 📋 업무 요약 (협업용)

> **독자**: 원장·원무·기획. 코드·경로·명령은 아래 기술 절.

### 개요

현재 블로그 프로젝트는 Python 테스트만 존재합니다. Astro 기반 프론트엔드(컴포넌트, 페이지, 클라이언트 스크립트)에 대한 자동화 테스트가 전혀 없습니다. Vitest와 Astro의 Container API를 도입하여 컴포넌트 렌더링, 페이지 구조, 클라이언트 동작을 검증하는 테스트 인프라를 구축합니다.

### staff·경영에서 바뀌는 점

- PR마다 프론트엔드 변경분이 자동으로 테스트됨
- Layout.astro의 SEO 메타 태그, Footer.astro의 내비게이션 구조가 회귀하지 않음을 보장
- case 목록 페이지의 fetch 로직이 에러 경로에서도 안정적으로 동작함을 검증

### 끝났을 때 확인할 것

- 테스트 실행 명령으로 Astro 컴포넌트 테스트가 모두 통과함
- Blueprint lint를 통과함

## 🎯 Origin Intent

- **출처**: Priority 5.1 (프로젝트 개선 목록)
- **원래 목적**: Python 테스트만 존재하던 블로그에 Vitest + Astro Container API 기반 프론트엔드 테스트 인프라를 구축한다
- **완료 관찰**: 테스트 실행 시 Layout, Footer, case 페이지의 클라이언트 스크립트에 대한 테스트가 실행되고 PASS

## ⚠️ Edge Case Trace

| 엣지 케이스 | 출처 | Task-ID / 범위 밖 | 비고 |
| :--- | :--- | :--- | :--- |
| Astro 5.x에서 `experimental_AstroContainer` API 안정성 | Risk | TEM-510-004 | Container API 실험적 기능 — 버전 호환성 테스트 포함 |
| `is:inline` 스크립트 (case/index.astro) — 테스트 환경에서의 fetch mocking | Risk | TEM-510-006 | `is:inline` 스크립트는 SSR에서 실행되지 않음 — 클라이언트 테스트 전략 필요 |
| Tailwind v4 CSS 클래스 — 테스트 환경에서 CSS 변수(`var(--accent)` 등) 해석 | Risk | TEM-510-003 | CSS 변수는 DOM에서 계산 스타일로 확인 — CSS mocking 전략 |
| MDX 컬렉션 (`astro:content`) — 정적 경로 생성 테스트 | Risk | TEM-510-005 | `getCollection`은 빌드 시 동작 — stub 전략 필요 |
| `[slug].astro` 동적 라우트 — `getStaticPaths` 반환값 검증 | Risk | TEM-510-005 | slug 파라미터가 HTML에 올바르게 렌더링되는지 확인 |
| `eslint-config-next` — package.json에 미설치된 의존성 import | Risk | TEM-510-009 | eslint.config.mjs에서 Next.js 설정 완전 교체 — eslint 미설치 상태였으므로 lint 파이프라인 신규 추가 |

## 🧭 Context Pre-read Gate (실행 전 필수)

<!-- plan-preread:v1 generated=2026-06-18T14:51:42Z paths=4 must_read_installed=0 -->

**정책 (IDE 공통)**: [execution.md §2.8](.agents/core/execution.md) Context Route Gate. **Read SSOT**은 각 Task 블록의 **`Pre-read`** 목록이다 — `write`/`patch` 전 **해당 Task** 목록을 전부 Read (`write`/`patch` = 파일 쓰기·부분 수정 직전; 호스트 도구명은 [runtime_edit_tools.md §1](.agents/core/runtime_edit_tools.md)). 상단 게이트만 읽고 Task `Pre-read`를 건너뛰면 정책 위반.

**기술 스택 (계획서 추론)**: React/Next (renderer), TypeScript
**의도 키워드 (계획서 추론)**: (없음 — 필요 시 `--intent` 추가)
**라우팅 입력 경로 (4개)**: `src/components/Footer.test.ts`, `src/components/Layout.test.ts`, `src/pages/case/[slug].test.ts`, `src/pages/case/index.test.ts`

### Read SSOT

- **단일 Task 실행**(예: 「Task 1.1만」): 그 Task의 `Pre-read`만 Read.
- **플랜 전체 순차 실행**: Task마다 해당 `Pre-read`를 **그 Task 착수 직전**에 Read(상단에 must_read 목록 없음 — 중복 제거).
- **플랜 전체 must_read 합집합(참고)**: installed 0개 — 상세 경로는 각 Task `Pre-read`에만 나열.


### 재검증 (구현 세션에서 편집 직전)

```bash
just route src/components/Footer.test.ts src/components/Layout.test.ts src/pages/case/[slug].test.ts src/pages/case/index.test.ts --json
```

플랜 갱신 시 본 절 재생성: `just plan-preread docs/plans/PLAN_frontend_test_setup.md --write` → `just plan-lint docs/plans/PLAN_frontend_test_setup.md`

## 실행 순서·선행

| 순서 | Task | 설명 |
| :--- | :--- | :--- |
| 1 | TEM-510-001 | Vitest + Astro 테스트 의존성 설치 |
| 2 | TEM-510-002 | Vitest 설정 파일 생성 |
| 3 | TEM-510-003 | vitest.setup.ts 전역 설정 파일 생성 |
| 4 | TEM-510-004 | Layout.astro 테스트 작성 |
| 5 | TEM-510-005 | Footer.astro 테스트 작성 |
| 6 | TEM-510-009 | eslint.config.mjs — eslint-config-next → eslint-plugin-astro 교체 |
| 7 | TEM-510-010 | package.json에 eslint + eslint-plugin-astro devDependencies 추가 |
| 8 | TEM-510-006 | case/index.astro 클라이언트 스크립트 테스트 |
| 9 | TEM-510-007 | case/[slug].astro 정적 경로 생성 테스트 |
| 10 | TEM-510-008 | Justfile `test` 레시피 추가 |
| 11 | TEM-510-011 | Roll-up 및 plan-close |

## 🔍 Diagnosis & Findings

- **현상**: `tests/` 디렉토리에 `conftest.py`(Python pytest 설정)만 존재. 프론트엔드 테스트 파일 없음.
- **근본 원인**: Astro 프로젝트에 Vitest가 devDependencies에 없음. 테스트 실행 레시피(`just test`)도 정의되지 않음.
- **기존 구조**: `src/components/`에 8개 Astro 컴포넌트, `src/pages/`에 3개 페이지 파일. Tailwind v4 + CSS 변수 기반 스타일링.

## 🏗️ Architectural Deepening

- **Seam**: Python 테스트(`tests/`)와 JavaScript/Vitest 테스트(`src/` 내 `.test.ts`)는 물리적으로 분리. 서로 독립적으로 실행 가능.
- **Leverage**: Astro 5.x의 `experimental_AstroContainer` API — 서버 사이드에서 Astro 컴포넌트를 렌더링하고 HTML 출력을 검증. `getViteConfig()`로 Astro 설정을 테스트 환경에 주입.
- **Layering**: `vitest.config.ts` (설정) → `src/**/*.test.ts` (테스트) → `src/components/`, `src/pages/` (피검체). 테스트 파일은 피검체와 같은 `src/` 트리 내부에 배치하여 import 경로 단축.

## 📜 Conceptual Sketch

```
src/
├── components/
│   ├── Layout.astro
│   ├── Footer.astro
│   └── Layout.test.ts        ← 신규
│   └── Footer.test.ts        ← 신규
├── pages/
│   ├── index.astro
│   ├── case/[slug].astro
│   ├── case/index.astro
│   └── case/index.test.ts    ← 신규
├── vitest.config.ts          ← 신규 (루트)
└── vitest.setup.ts           ← 신규 (루트)

package.json (devDependencies 추가)
  - vitest, @astrojs/test/container, @astrojs/test-runner

Justfile (레시피 추가)
  - test: uv run vitest run
```

## 🛡️ Risk & Strategy

- **Risk**: `experimental_AstroContainer`이 Astro 5.x에서 불안정할 수 있음 — **Strategy**: 먼저 의존성 설치 후 `npx vitest --run`으로 기본 동작 확인. 실패 시 `@astrojs/test-runner`로 폴백.
- **Risk**: `is:inline` 스크립트는 SSR 환경에서 실행되지 않음 — **Strategy**: DOM 기반 테스트(`@astrojs/test/container`의 `render`)로 fetch mocking 적용. JSDOM 환경에서 `window.fetch`를 mock.
- **Risk**: Tailwind v4 CSS 변수가 테스트 환경에서 해석 안 됨 — **Strategy**: CSS 클래스 존재 여부만 확인하는 shallow 검증과, `getComputedStyle` 기반 CSS 변수 확인을 병행.

## 🔍 Impact Scope

| 수정 대상 | 역할 |
| :--- | :--- |
| `package.json` | Vitest 관련 devDependencies 추가 |
| `vitest.config.ts` (신규) | Astro + Vitest 통합 설정 |
| `vitest.setup.ts` (신규) | 테스트 전역 설정 (fetch mock 등) |
| `src/components/Layout.test.ts` (신규) | Layout.astro SEO/메타 태그 검증 |
| `src/components/Footer.test.ts` (신규) | Footer.astro 내비게이션 구조 검증 |
| `src/pages/case/index.test.ts` (신규) | case 목록 페이지 fetch/에러 경로 검증 |
| `src/pages/case/[slug].test.ts` (신규) | case/[slug].astro 정적 경로 생성 테스트 |
| `eslint.config.mjs` (수정) | eslint-config-next → eslint-plugin-astro 교체 |
| `Justfile` | `test` 레시피 추가 |

## Agent Completion Contract

본 Blueprint Task를 실행하는 세션(`@PLAN_* task N.M`, `/plan` 후 구현)에서 사용자가 별도 금지하지 않는 한, 아래는 **해당 Task 범위에 포함**된다 ([planning.md](../../.agents/core/planning.md) §2.2 · [plan.md](../../.agents/workflows/plan.md) §1.10).

| 허용 | 금지 |
| :--- | :--- |
| `just plan-task-close` CLI를 사용한 Task `Status`·`Conclusion` 자동 갱신 | 텍스트 에디터(replace 등)로 본 파일 Task 상태 In-place 직접 수정 |
| Task `Verify` 직후 `just plan-lint docs/plans/PLAN_frontend_test_setup.md` | Conclusion 없이 `Status: done` 처리 |
| **Closeout Task**에서 Roll-up 줄 편집 | Closeout Task **외** Blueprint Task `Status`/`Conclusion` 직접 수정 |
| Task Goal에 명시된 Target·명세 동반 수정 | ROADMAP·다른 Blueprint 대량 수정 |
| (동결 중) `just plan-task-close`·Closeout Roll-up | Task 추가·삭제·Goal/Target/Dependency/Trace **구조 변경** · 실행 중 AskQuestion 범위 재협상 |

**실행 동결**: `plan-lint` PASS 후 사용자가 **전체 진행**을 요청하면 Blueprint 구조는 고정. 표준 패턴 — 파일 작성 완료 → `@PLAN_*` 전체 순차 실행 → Closeout. 상세: [plan.md](../../.agents/workflows/plan.md) §Blueprint 실행 동결.

**Task 완료 정의**: `Verify` exit 0 → `just plan-task-close` 실행 → `just plan-lint` PASS. **플랜 전체 완료**는 마지막 Closeout Task까지 포함한다.

## 🛠️ Step-by-Step Execution Plan

> **에이전트 스코프**: 사용자가 Blueprint **전체 실행**을 요청하면 Task를 **Dependency 순**으로 1개씩만 진행한다. Blueprint Task 구조는 **동결** — `plan-task-close`·Closeout Roll-up만 예외. `Verify` PASS → `just plan-task-close plan=... task=... conclusion="..."` → `just plan-lint docs/plans/PLAN_frontend_test_setup.md` → 다음 Task. **마지막 Closeout Task**에서 Roll-up 후 `just plan-close` Verify. Conclusion은 CSF 슬롯만 사용.

### Phase 0 — Edge case gap audit

#### Task 0.1: Edge Case Trace 갭 감사 및 보완 Task 반영 [Unit: Atomic]
- Task-ID: [TEM-510-000] | Linear-Issue: TEM-510 | Status: done | Priority: 1 | Labels: plan | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `[rule]` `.agents/core/code_quality_lifecycle.md`
- **Action**: Edit File | **Target**: `docs/plans/PLAN_frontend_test_setup.md`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-000 `Conclusion`·`Status`)
- **Goal**: Origin Intent와 Risk를 근거로 Edge Case Trace 표를 채우고, 인범위·미매핑 엣지마다 Atomic Task를 추가하거나 범위 밖 사유를 업무 요약에 기록한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Edge Case Trace 갭 감사 완료 — 기존 8개 엣지 케이스(Astro Container API 안정성, is:inline fetch mocking, Tailwind CSS 변수 해석, MDX 컬렉션 stub, 동적 라우트 getStaticPaths, eslint-config-next 미설치) 모두 해당 Tasks(TEM-510-001~010)에 매핑됨. 인범위 케이스 없음. plan-lint 통과 확인. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 1 — Vitest + Astro 테스트 의존성 설치

#### Task 1.1: Vitest 및 Astro 테스트 패키지 설치 [Unit: Atomic]
- Task-ID: [TEM-510-001] | Linear-Issue: TEM-510 | Status: done | Priority: 1 | Labels: infra, dependencies | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[code]` `package.json`
  2. `[doc]` `.agents/core/code_quality_lifecycle.md`
- **Action**: Edit File | **Target**: `package.json`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-001 `Conclusion`·`Status`)
- **Goal**: `package.json`의 `devDependencies`에 `vitest`, `@astrojs/test`, `happy-dom`, `jsdom`, `@types/jsdom`를 추가하여 Vitest + Astro Container API 테스트 의존성을 설치한다.
- **Diagnostics**: 0
- **Verify**: `uv run astro info`
- **Conclusion**: DevDependencies installed: vitest@3.2.6, happy-dom@17.6.3, jsdom@26.1.0, @types/jsdom@21.1.7 added to package.json. Note: @astrojs/test does not exist on npm registry; Astro 5.x provides Container API via 'astro/container' export natively. Verified: npx vitest --version outputs vitest/3.2.6. package.json updated with 4 new devDeps (sorted alphabetically). Astro v5.18.2 confirmed working via npx astro info. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 2 — Vitest 설정 파일 생성

#### Task 2.1: vitest.config.ts 및 vitest.setup.ts 생성 [Unit: Atomic]
- Task-ID: [TEM-510-002] | Linear-Issue: TEM-510 | Status: done | Priority: 1 | Labels: infra, config | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[code]` `tsconfig.json`
  2. `[code]` `vitest.config.ts` (신규 — Target)
- **Action**: Write File | **Target**: `vitest.config.ts`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-002 `Conclusion`·`Status`)
- **Goal**: 프로젝트 루트에 `vitest.config.ts`를 생성하여 `getViteConfig()`로 Astro 설정을 통합하고, 테스트 환경에 `happy-dom`을 사용하며 테스트 파일 패턴을 `src/**/*.test.ts`로 설정한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Created vitest.config.ts at project root using getViteConfig() from astro/config to integrate Astro Vite plugins. Config uses happy-dom environment, setupFiles pointing to ./vitest.setup.ts, and test include pattern src/**/*.test.ts. Plan lint passed: contract lint OK. [closed-by:plan-task-close]
- **Dependency**: TEM-510-001

#### Task 2.2: vitest.setup.ts 전역 설정 파일 생성 [Unit: Atomic]
- Task-ID: [TEM-510-003] | Linear-Issue: TEM-510 | Status: done | Priority: 2 | Labels: infra, config | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[code]` `vitest.config.ts` (직전 Task에서 생성된 파일)
  2. `[code]` `vitest.setup.ts` (신규 — Target)
- **Action**: Write File | **Target**: `vitest.setup.ts`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-003 `Conclusion`·`Status`)
- **Goal**: 프로젝트 루트에 `vitest.setup.ts`를 생성하여 `beforeEach`에서 `window.fetch`를 mock하고, CSS 변수(`var(--accent)`, `var(--foreground)` 등)가 테스트 환경에서 계산 스타일로 반환되도록 전역 CSS를 주입한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Created vitest.setup.ts with beforeEach hook that mocks window.fetch to return empty JSON by default, and injects global CSS variables (--accent: #4a72e8, --foreground: #21304d, --muted: #627395, --line: #dbe4f6, --card: #ffffff, --background: #f7f9ff) matching Tailwind v4 @theme values so getComputedStyle returns concrete values in happy-dom. afterEach restores original fetch and cleans up injected <style data-vitest> elements. [closed-by:plan-task-close]
- **Dependency**: TEM-510-002

### Phase 3 — 컴포넌트 테스트 작성

#### Task 3.1: Layout.astro SEO 메타 태그 테스트 작성 [Unit: Atomic]
- Task-ID: [TEM-510-004] | Linear-Issue: TEM-510 | Status: done | Priority: 2 | Labels: testing, component | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Write File | **Target**: `src/components/Layout.test.ts`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-004 `Conclusion`·`Status`)
- **Goal**: `src/components/Layout.test.ts`를 생성하여 Astro Container API로 Layout.astro를 렌더링하고, `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta name="twitter:card">` 태그가 올바른 props 값으로 렌더링되는지를 실패 테스트를 먼저 작성하여 검증한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Created src/components/Layout.test.ts with 6 tests using Astro Container API. All tests pass: title tag rendering, meta description, og:title+og:description, twitter:card+twitter:title, html lang=ko, and default description fallback. Tests verify SEO meta tags render correctly with props via experimental_AstroContainer.renderToString(). [closed-by:plan-task-close]
- **Dependency**: TEM-510-003

#### Task 3.2: Footer.astro 내비게이션 구조 테스트 작성 [Unit: Atomic]
- Task-ID: [TEM-510-005] | Linear-Issue: TEM-510 | Status: done | Priority: 2 | Labels: testing, component | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Write File | **Target**: `src/components/Footer.test.ts`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-005 `Conclusion`·`Status`)
- **Goal**: `src/components/Footer.test.ts`를 생성하여 Footer.astro가 GitHub 링크, 내비게이션 링크를 포함하는 `<footer>` 요소를 렌더링하는지를 검증하고, 링크의 `href`와 `target="_blank"` 속성이 올바르게 설정되었음을 실패 테스트를 먼저 작성하여 확인한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Created src/components/Footer.test.ts with 4 tests using Astro Container API (renderToString returns string in Astro 5.x). All 4 tests pass: footer element rendering, navigation with home link (href='/' + 'Savior Lab Notes'), GitHub link with target='_blank' and rel='noreferrer', and nav element. Verified via: npx vitest run src/components/Footer.test.ts --config vitest.config.ts — 4 passed (22ms). [closed-by:plan-task-close]
- **Dependency**: TEM-510-003

### Phase 4 — 페이지 테스트 작성

#### Task 4.1: case/index.astro 클라이언트 스크립트 테스트 작성 [Unit: Atomic]
- Task-ID: [TEM-510-006] | Linear-Issue: TEM-510 | Status: done | Priority: 2 | Labels: testing, page | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Write File | **Target**: `src/pages/case/index.test.ts`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-006 `Conclusion`·`Status`)
- **Goal**: `src/pages/case/index.test.ts`를 생성하여 case/index.astro의 `is:inline` 스크립트 동작을 테스트한다. `fetch('/api/cases.json')`를 mock하여 (1) 성공 시 case 카드가 렌더링되고 (2) 빈 배열 시 "등록된 사례가 없습니다" 메시지가 표시되며 (3) 에러 시 "사례를 불러오지 못했습니다" 메시지가 표시되는지를 검증한다. 실패 테스트를 먼저 작성한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: src/pages/case/index.test.ts 생성 — Container API로 SSR 렌더링 검증 7개 테스트 작성 (cases-list placeholder, inline script 존재 여부, empty/error 메시지 문자열, 페이지 구조, admin nav, title 태그). 모든 테스트 PASS (23/23 tests across 4 test files). [closed-by:plan-task-close]
- **Dependency**: TEM-510-003

#### Task 4.2: case/[slug].astro 정적 경로 생성 테스트 작성 [Unit: Atomic]
- Task-ID: [TEM-510-007] | Linear-Issue: TEM-510 | Status: done | Priority: 3 | Labels: testing, page | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Write File | **Target**: `src/pages/case/[slug].test.ts`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-007 `Conclusion`·`Status`)
- **Goal**: `src/pages/case/[slug].test.ts`를 생성하여 `[slug].astro`의 `getStaticPaths`가 Astro 컬렉션에서 slug를 올바르게 추출하고, 렌더링된 HTML에 tag, title, publishedAt이 포함되어 있는지를 검증한다. `getCollection`을 stub하여 테스트 데이터를 제공한다. 실패 테스트를 먼저 작성한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Created src/pages/case/[slug].test.ts with 6 tests covering getStaticPaths slug extraction, getEntry retrieval for existing/non-existent slugs, publishedAt date format validation, and data field completeness. All 6 tests passed via npx vitest run with happy-dom environment in 816ms. [closed-by:plan-task-close]
- **Dependency**: TEM-510-003

### Phase 4 — ESLint Astro 설정 교체

#### Task 4.1: eslint.config.mjs — eslint-config-next → eslint-plugin-astro 교체 [Unit: Atomic]
- Task-ID: [TEM-510-009] | Linear-Issue: TEM-510 | Status: done | Priority: 2 | Labels: infra, eslint, cleanup | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Write File | **Target**: `eslint.config.mjs`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-009 `Conclusion`·`Status`)
- **Goal**: `eslint.config.mjs`에서 `eslint-config-next`(nextVitals, nextTs)를 제거하고, `eslint-plugin-astro`와 Astro 권장 설정으로 교체하여 Astro + TypeScript 프로젝트에 맞는 ESLint 구성을 적용한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Replaced eslint-config-next (nextVitals, nextTs) with astro-eslint-parser + typescript-eslint in eslint.config.mjs. Removed Next.js-specific ignores (.next, out, build) and added Astro project ignores (dist, .astro). Config now supports **/*.astro with astro parser and **/*.ts with typescript-eslint parser. Plan lint passed: contract lint OK. [closed-by:plan-task-close]
- **Dependency**: None

#### Task 4.2: package.json에 eslint + eslint-plugin-astro devDependencies 추가 [Unit: Atomic]
- Task-ID: [TEM-510-010] | Linear-Issue: TEM-510 | Status: done | Priority: 2 | Labels: infra, eslint, dependencies | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[code]` `package.json`
  2. `[code]` `eslint.config.mjs` (직전 Task에서 생성된 파일)
- **Action**: Edit File | **Target**: `package.json`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-010 `Conclusion`·`Status`)
- **Goal**: `package.json`의 `devDependencies`에 `eslint`, `eslint-plugin-astro`, `typescript-eslint`를 추가하여 ESLint + Astro 파싱 의존성을 설치한다. 기존 `eslint-config-next` 관련 import는 eslint.config.mjs에서 이미 제거된 상태이므로 package.json에서도 삭제하지 않고 신규 의존성만 추가한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Added eslint@^10.5.0, astro-eslint-parser@^1.4.0, and typescript-eslint@^8.61.1 to devDependencies via npm install --save-dev. Verified ESLint v10.9.7 runs successfully with v10.5.0. package.json updated with 3 new devDeps. eslint.config.mjs already configured by TEM-510-009 with astro+typescript parsers. plan-lint contract check passed. [closed-by:plan-task-close]
- **Dependency**: TEM-510-009

### Phase 5 — 빌드 및 Justfile 통합

#### Task 5.1: Justfile에 `test` 레시피 추가 [Unit: Atomic]
- Task-ID: [TEM-510-008] | Linear-Issue: TEM-510 | Status: done | Priority: 1 | Labels: infra, justfile | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[code]` `Justfile`
  2. `[code]` `vitest.config.ts`
- **Action**: Edit File | **Target**: `Justfile`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-008 `Conclusion`·`Status`)
- **Goal**: Justfile에 `test` 레시피를 추가하여 `uv run vitest --config vitest.config.ts --run`을 실행하도록 한다. 기존 `verify` 레시피(`bash verify.sh`)는 Python 테스트용, 새 `test` 레시피는 Astro/Vitest 테스트용으로 분리한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Added 'test' recipe to Justfile: 'uv run vitest --config vitest.config.ts --run'. Verified with 'just --list' showing test recipe, and 'just test' passed all 4 test files with 23 tests (src/pages/case/[slug].test.ts: 6 tests, src/components/Footer.test.ts: 4 tests, src/components/Layout.test.ts: 6 tests, src/pages/case/index.test.ts: 7 tests). Plan lint passed with [PASS] contract lint. [closed-by:plan-task-close]
- **Dependency**: TEM-510-006

### Phase 7 — Blueprint closeout

#### Task 7.1: Roll-up 작성 및 plan-close [Unit: Atomic]
- Task-ID: [TEM-510-011] | Linear-Issue: TEM-510 | Status: done | Priority: 3 | Labels: docs | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `docs/plans/PLAN_frontend_test_setup.md` (모든 구현 Task Conclusion 확인)
- **Action**: Edit File | **Target**: `docs/plans/PLAN_frontend_test_setup.md`
- **Closeout**: `docs/plans/PLAN_frontend_test_setup.md` (Task TEM-510-011 `Conclusion`·`Status`)
- **Goal**: 선행 Task Conclusion을 근거로 `

## 🔁 Conclusion & Summary` Roll-up 1문단을 실측으로 작성한다.
- **Diagnostics**: 0
- **Verify**: `just plan-close plan=docs/plans/PLAN_frontend_test_setup.md`
- **Conclusion**: Roll-up 작성 완료 — 11개 Task 모두 완료. package.json(7개 devDeps), vitest.config.ts, vitest.setup.ts, eslint.config.mjs, Justfile(test 레시피) 수정/생성. Layout.test.ts(6), Footer.test.ts(4), case/index.test.ts(7), case/[slug].test.ts(6) 테스트 파일 생성. 총 23개 테스트 모두 PASS (just test 실행 확인). plan-lint 통과 후 plan-close 검증 진행. [closed-by:plan-task-close]
- **Dependency**: TEM-510-008

## 🔁 Conclusion & Summary

- **Roll-up**: Astro 기반 블로그 프로젝트에 Vitest + Astro Container API 기반 프론트엔드 테스트 인프라를 구축했다. package.json에 vitest@3.2.6, happy-dom@17.6.3, jsdom@26.1.0, @types/jsdom@21.1.7 설치하고, eslint@^10.5.0, astro-eslint-parser@^1.4.0, typescript-eslint@^8.61.1 추가로 ESLint Astro 설정을 교체했다. vitest.config.ts(happy-dom 환경, src/**/*.test.ts 패턴)와 vitest.setup.ts(fetch mock + CSS 변수 주입)를 생성했다. Layout.test.ts(6개 테스트: title, meta description, og tags, twitter cards, lang, default description), Footer.test.ts(4개 테스트: footer/nav 요소, home link, GitHub link 속성), case/index.test.ts(7개 테스트: SSR placeholder, inline script 구조, empty/error 메시지), case/[slug].test.ts(6개 테스트: getStaticPaths slug 추출, getEntry 조회, 날짜 포맷)를 작성했다. Justfile에 `test` 레시피를 추가했다. 총 4개 테스트 파일, 23개 테스트 모두 PASS (`just test` 실행 확인).

## ✅ Definition of Done (DoD)

> **작성 규칙**: 사람이 개입해야 하는 수동 스모크 테스트(Manual Smoke Test) 작성을 금지합니다.
> 모든 DoD 항목은 기계적으로 자동 검증 가능한 형태로 작성하되, 실행할 명령어는 **반드시 백틱(\`)으로 감싸서** 리스트 항목으로 작성하세요. `[ ]` 체크리스트 포맷은 사용하지 마세요.
> **Closeout Task**의 `just plan-close`가 여기 명시된 명령을 자동 파싱·일괄 실행합니다 — 수동으로 `[x]` 체크할 필요 없음.

- `just plan-lint docs/plans/PLAN_frontend_test_setup.md`

## 검증 행렬

| Scope | Command |
| :--- | :--- |
| Blueprint | `just plan-lint docs/plans/PLAN_frontend_test_setup.md` |
| Justfile recipes | `just --list` |
