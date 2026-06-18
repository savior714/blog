<!-- Language: ko -->

# 🗺️ Project Blueprint: 성능 최적화 (폰트·이미지·로딩)

## 문서 메타
- **Last Verified**: 2026-06-18 | **Tested Version**: astro@5.18.2
- **Reference**: `src/styles/global.css`, `src/pages/case/[slug].astro`, `astro.config.mjs`
- **SSOT Check**: N/A
- **Project Status Link**: N/A
- **Linear-Issue**: TEM-356
- **Priority**: 3
- **Labels**: performance, astro-assets, font-loading
- **Architectural Goal**: 외부 CDN 의존 제거 + Astro astro:assets 파이프라인 도입으로 폰트·썸네일·로딩 성능을 정량 개선

## 📎 관련 명세

> **아카이브 필수**: `/archive` 시 `just plan-lint <file> --archive-ready`가 본 절(「관련 명세」) 또는 본문 `docs/specs/` 문자열을 검사합니다. `SSOT Check`와 별개입니다.

| 문서 | 범위 |
| :--- | :--- |
| `docs/specs/technical/SPEC_TAILWIND_THEME.md` | Tailwind v4 + CSS 변수 기반 테마 (폰트·색상) |
| `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md` | SEO 메타태그 구조 (Image OG과 연관) |

## 📋 업무 요약 (협업용)

> **독자**: 원장·원무·기획. 코드·경로·명령은 아래 기술 절.

### 개요

현재 블로그는 폰트를 외부 CDN(jsdelivr)에서 직접 로딩하고, 썸네일 이미지를 img 태그로 그대로 노출하며, lazy 로딩을 설정하지 않고 있습니다. 또한 Vercel Image Optimization 기능을 Astro 설정에서 활성화하지 않아, 이미지 최적화 파이프라인을 활용하지 못하고 있습니다.

### staff·경영에서 바뀌는 점

- 폰트 로딩이 외부 CDN 의존에서 프로젝트 내 npm 패키지로 전환되어 안정성과 로딩 속도 개선
- 썸네일 이미지가 AVIF/WebP 자동 변환으로 용량 절감 (약 30-70% 감소 예상)
- 아래로 스크롤할 때만 이미지가 로딩되어 초기 페이지 로드 시간 단축
- Vercel CDN을 통한 이미지 최적화가 자동으로 적용됨

### 끝났을 때 확인할 것

- 빌드 명령어 실행 시 빌드 성공
- 페이지에서 Pretendard 폰트가 정상 렌더링
- 썸네일 페이지에서 AVIF/WebP 포맷 이미지 확인
- Lighthouse 성능 점수 개선

## 🎯 Origin Intent

- **출처**: 직접 요청 (Priority 3 성능 최적화 항목)
- **원래 목적**: 폰트 CDN 직접 로딩, 썸네일 img 최적화, lazy 로딩 미설정, Vercel Image Optimization 미활용 4개 항목을 순차적으로 개선
- **완료 관찰**: plan-lint PASS + plan-close exit 0

## ⚠️ Edge Case Trace

| 엣지 케이스 | 출처 | Task-ID / 범위 밖 | 비고 |
| :--- | :--- | :--- | :--- |
| SVG 썸네일 — AI 생성 SVG는 astro:assets 대상 아님 | Origin | 3.1, 3.3 | SVG는 img 대신 dangerouslySetInnerHTML로 렌더링 중이므로 최적화 범위 제외 |
| @fontsource/pretendard는 WOFF2만 제공 — 기존 WOFF fallback 필요 | Domain | 3.1 | Astro v5는 기본적으로 WOFF2를 지원하므로 별도 fallback 불필요 |
| Vercel image service는 정적 빌드에서만 동작 | Astro docs | 3.4 | 현재 설정에 output: static 미지정 — 추가 필요 |
| astro:assets는 프로젝트 내 src/assets/ 디렉토리 이미지만 import 가능 | Astro docs | 3.2 | 외부 URL 썸네일은 lazy 로딩만 적용하고 astro:assets 전환 불가 |

## 🧭 Context Pre-read Gate (실행 전 필수)

<!-- plan-preread:v1 generated=2026-06-18T13:42:14Z paths=2 must_read_installed=0 -->

**정책 (IDE 공통)**: [execution.md §2.8](.agents/core/execution.md) Context Route Gate. **Read SSOT**은 각 Task 블록의 **`Pre-read`** 목록이다 — `write`/`patch` 전 **해당 Task** 목록을 전부 Read (`write`/`patch` = 파일 쓰기·부분 수정 직전; 호스트 도구명은 [runtime_edit_tools.md §1](.agents/core/runtime_edit_tools.md)). 상단 게이트만 읽고 Task `Pre-read`를 건너뛰면 정책 위반.

**기술 스택 (계획서 추론)**: (경로에서 스택 신호 미확인 — Impact Scope·Target 보강 권장)
**의도 키워드 (계획서 추론)**: ui
**라우팅 입력 경로 (2개)**: `src/pages/case/[slug].astro`, `src/styles/global.css`

### Read SSOT

- **단일 Task 실행**(예: 「Task 1.1만」): 그 Task의 `Pre-read`만 Read.
- **플랜 전체 순차 실행**: Task마다 해당 `Pre-read`를 **그 Task 착수 직전**에 Read(상단에 must_read 목록 없음 — 중복 제거).
- **플랜 전체 must_read 합집합(참고)**: installed 0개 — 상세 경로는 각 Task `Pre-read`에만 나열.


### 재검증 (구현 세션에서 편집 직전)

```bash
just route src/pages/case/[slug].astro src/styles/global.css --json
```

플랜 갱신 시 본 절 재생성: `just plan-preread docs/plans/PLAN_performance_optimization.md --write` → `just plan-lint docs/plans/PLAN_performance_optimization.md`

## 🔍 Diagnosis & Findings

- **현상**: 폰트를 jsdelivr CDN에서 3개 weight(WOFF)로 외부 로딩, 썸네일 img 태그에 최적화·지연로딩 미적용, Vercel image service 미설정
- **근본 원인**: astro.config.mjs에 imageService 설정 누락, global.css에 @font-face 직접 서술, 페이지 컴포넌트에서 astro:assets 미사용

## 🏗️ Architectural Deepening

- **Seam**: global.css(폰트) ↔ case/[slug].astro(이미지) ↔ astro.config.mjs(Vercel service) — 3개 파일 간 의존 분리
- **Leverage**: Astro v5 내장 astro:assets Picture 컴포넌트 + Vercel Image Optimization API로 자동 AVIF/WebP 변환

## 📜 Conceptual Sketch

```
Before:
  global.css → @font-face → cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff
  case/[slug].astro → <img src={thumbnail} alt={title}>
  astro.config.mjs → adapter: vercel() (no imageService)

After:
  global.css → @import "@fontsource/pretendard"
  case/[slug].astro → <Picture src={thumbnail} formats={['avif', 'webp']} alt={title} loading="lazy" />
  astro.config.mjs → adapter: vercel({ imageService: true }), output: 'static'
```

## 🛡️ Risk & Strategy

- **Risk**: @fontsource/pretendard 설치 후 CSS 변수·@font-face 제거 누락 → 폰트 깨짐
  **Strategy**: Task 1.1에서 @font-face 제거 + @import 추가를 한 번에 수행, Verify로 빌드 검증
- **Risk**: 외부 URL 썸네일을 astro:assets로 전환 불가 — format mismatch
  **Strategy**: 외부 URL 이미지는 lazy 로딩만 적용, 내부 자산만 astro:assets Picture로 전환
- **Risk**: Vercel image service 활성화 시 정적 빌드 설정 변경 필요
  **Strategy**: astro.config.mjs에 output: static + imageService: true를 adapter 옵션으로 추가

## 🔍 Impact Scope

| 수정 대상 | 역할 |
| :--- | :--- |
| `src/styles/global.css` | CDN @font-face 제거, @fontsource import로 교체 |
| `src/pages/case/[slug].astro` | img → Picture 전환, lazy 로딩 추가 |
| `astro.config.mjs` | Vercel image service 설정 (imageService: true, output: static) |
| `package.json` (의존성) | @fontsource/pretendard 추가 |

## Agent Completion Contract

본 Blueprint Task를 실행하는 세션(`@PLAN_* task N.M`, `/plan` 후 구현)에서 사용자가 별도 금지하지 않는 한, 아래는 **해당 Task 범위에 포함**된다 ([planning.md](../../.agents/core/planning.md) §2.2 · [plan.md](../../.agents/workflows/plan.md) §1.10).

| 허용 | 금지 |
| :--- | :--- |
| `just plan-task-close` CLI를 사용한 Task `Status`·`Conclusion` 자동 갱신 | 텍스트 에디터(replace 등)로 본 파일 Task 상태 In-place 직접 수정 |
| Task `Verify` 직후 `just plan-lint docs/plans/PLAN_performance_optimization.md` | Conclusion 없이 `Status: done` 처리 |
| **Closeout Task**에서 Roll-up 줄 편집 | Closeout Task **외** Blueprint Task `Status`/`Conclusion` 직접 수정 |
| Task Goal에 명시된 Target·명세 동반 수정 | ROADMAP·다른 Blueprint 대량 수정 |
| (동결 중) `just plan-task-close`·Closeout Roll-up | Task 추가·삭제·Goal/Target/Dependency/Trace **구조 변경** · 실행 중 AskQuestion 범위 재협상 |

**실행 동결**: `plan-lint` PASS 후 사용자가 **전체 진행**을 요청하면 Blueprint 구조는 고정. 표준 패턴 — 파일 작성 완료 → `@PLAN_*` 전체 순차 실행 → Closeout. 상세: [plan.md](../../.agents/workflows/plan.md) §Blueprint 실행 동결.

**Task 완료 정의**: `Verify` exit 0 → `just plan-task-close` 실행 → `just plan-lint` PASS. **플랜 전체 완료**는 마지막 Closeout Task까지 포함한다.

## 🛠️ Step-by-Step Execution Plan

> **에이전트 스코프**: 사용자가 Blueprint **전체 실행**을 요청하면 Task를 **Dependency 순**으로 1개씩만 진행한다. Blueprint Task 구조는 **동결** — `plan-task-close`·Closeout Roll-up만 예외. `Verify` PASS → `just plan-task-close plan=... task=... conclusion="..."`로 Conclusion 갱신 → `just plan-lint docs/plans/PLAN_performance_optimization.md`로 검증 → 다음 Task. **마지막 Closeout Task**에서 Roll-up 후 `just plan-close` Verify.

### Phase 1 — 폰트 CDN 직접 로딩 → @fontsource/pretendard

#### Task 1.1: @fontsource/pretendard 설치 및 global.css 폰트 교체 [Unit: Atomic]
- Task-ID: [TEM-356-001] | Linear-Issue: TEM-356 | Status: done | Priority: 1 | Labels: performance, font-loading | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Install package + Edit File | **Target**: `src/styles/global.css`
- **Closeout**: `docs/plans/PLAN_performance_optimization.md` (Task TEM-356-001 `Conclusion`·`Status`)
- **Goal**: @fontsource/pretendard npm 패키지를 설치한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: @fontsource/pretendard npm 패키지 설치 완료. npm install @fontsource/pretendard --legacy-peer-deps 실행 후 1개 패키지 추가됨 (audited 471 packages). package.json에 의존성 추가 확인. [closed-by:plan-task-close]
- **Dependency**: None

#### Task 1.2: global.css에서 @font-face 제거 및 @fontsource import 추가 [Unit: Atomic]
- Task-ID: [TEM-356-002] | Linear-Issue: TEM-356 | Status: done | Priority: 1 | Labels: performance, font-loading | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/styles/global.css`
- **Closeout**: `docs/plans/PLAN_performance_optimization.md` (Task TEM-356-002 `Conclusion`·`Status`)
- **Goal**: global.css의 3개 @font-face 선언을 제거하고 @import "@fontsource/pretendard"로 교체한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: global.css에서 jsdelivr CDN @font-face 3개 선언(Regular/SemiBold/Bold) 제거 및 @import @fontsource/pretendard로 교체 완료. npm run build 실행 시 빌드 성공 확인 (37ms 완료, server assets rearranging 정상). [closed-by:plan-task-close]
- **Dependency**: TEM-356-001

### Phase 2 — 썸네일 img 최적화 → astro:assets Picture

#### Task 2.1: case/[slug].astro에 astro:assets Picture import 추가 [Unit: Atomic]
- Task-ID: [TEM-356-003] | Linear-Issue: TEM-356 | Status: done | Priority: 1 | Labels: performance, astro-assets | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/[slug].astro`
- **Closeout**: `docs/plans/PLAN_performance_optimization.md` (Task TEM-356-003 `Conclusion`·`Status`)
- **Goal**: case/[slug].astro의 front-matter에 Picture 컴포넌트를 astro:assets에서 import한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: case/[slug].astro front-matter에 Picture 컴포넌트 astro:assets에서 import 추가 완료. import { Picture } from 'astro:assets'; 문장 삽입 확인. [closed-by:plan-task-close]
- **Dependency**: None

#### Task 2.2: case/[slug].astro 썸네일 img를 Picture 컴포넌트로 전환 [Unit: Atomic]
- Task-ID: [TEM-356-004] | Linear-Issue: TEM-356 | Status: done | Priority: 1 | Labels: performance, astro-assets | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/[slug].astro`
- **Closeout**: `docs/plans/PLAN_performance_optimization.md` (Task TEM-356-004 `Conclusion`·`Status`)
- **Goal**: case/[slug].astro의 썸네일 img 태그를 Picture 컴포넌트로 전환하고 AVIF/WebP 포맷을 설정한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: case/[slug].astro 썸네일 img 태그를 Picture 컴포넌트로 전환 완료. <Picture src={thumbnail} alt={title} class=detail-thumb formats={['avif', 'webp']} loading=lazy />로 변경. npm run build 빌드 성공 확인 (38ms 완료). [closed-by:plan-task-close]
- **Dependency**: TEM-356-003

### Phase 3 — lazy 로딩 미설정 → lazy 로딩 추가

#### Task 3.1: case/[slug].astro 썸네일 이미지에 loading="lazy" 추가 [Unit: Atomic]
- Task-ID: [TEM-356-005] | Linear-Issue: TEM-356 | Status: done | Priority: 2 | Labels: performance, lazy-loading | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/[slug].astro`
- **Closeout**: `docs/plans/PLAN_performance_optimization.md` (Task TEM-356-005 `Conclusion`·`Status`)
- **Goal**: case/[slug].astro의 썸네일 이미지 태그에 loading="lazy" 속성을 추가한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: case/[slug].astro 썸네일 이미지에 loading=lazy 속성 추가 완료. Picture 컴포넌트 전환 시 함께 적용됨 (<Picture ... loading=lazy />). npm run build 빌드 성공으로 검증 (38ms). [closed-by:plan-task-close]
- **Dependency**: TEM-356-004

### Phase 4 — Vercel Image Optimization 미활용 → imageService 설정

#### Task 4.1: astro.config.mjs에 Vercel imageService 활성화 [Unit: Atomic]
- Task-ID: [TEM-356-006] | Linear-Issue: TEM-356 | Status: done | Priority: 2 | Labels: performance, vercel | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `astro.config.mjs` (현재 설정 확인)
  2. `vercel.json` (빌드 설정 확인)
- **Action**: Edit File | **Target**: `astro.config.mjs`
- **Closeout**: `docs/plans/PLAN_performance_optimization.md` (Task TEM-356-006 `Conclusion`·`Status`)
- **Goal**: astro.config.mjs에 output: static 옵션과 Vercel adapter의 imageService: true 설정을 추가한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: astro.config.mjs에 Vercel imageService: true 활성화 및 output: 'static' 옵션 추가 완료. adapter: vercel({ imageService: true }), output: 'static' 설정 확인. npm run build 빌드 성공 검증 (128ms 완료, static 파일 복사 정상). [closed-by:plan-task-close]
- **Dependency**: None

### Phase 5 — Blueprint closeout

#### Task 5.1: Roll-up 작성 및 plan-close [Unit: Atomic]
- Task-ID: [TEM-356-099] | Linear-Issue: TEM-356 | Status: done | Priority: 3 | Labels: docs | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. `.agents/workflows/plan.md`
- **Action**: Edit File | **Target**: `docs/plans/PLAN_performance_optimization.md`
- **Closeout**: `docs/plans/PLAN_performance_optimization.md` (Task TEM-356-099 `Conclusion`·`Status`)
- **Goal**: 선행 Task Conclusion을 근거로 Conclusion and Summary Roll-up 1문단을 실측으로 작성한다.
- **Diagnostics**: 0
- **Verify**: `just plan-close plan=docs/plans/PLAN_performance_optimization.md`
- **Conclusion**: Roll-up 작성 완료. 6개 Task 모두 완료: (1) @fontsource/pretendard 설치, (2) global.css @font-face→@import 교체, (3) Picture import 추가, (4) img→Picture 전환+AVIF/WebP, (5) loading='lazy' 추가, (6) astro.config.mjs imageService:true+output:static. npm run build 빌드 성공 3회 검증 (37ms/38ms/128ms). [closed-by:plan-task-close]
- **Dependency**: TEM-356-006

## 🔁 Conclusion & Summary

- **Roll-up**: 폰트 CDN(jsdelivr) 의존 제거 — @fontsource/pretendard npm 패키지로 전환하여 global.css의 3개 @font-face 선언을 @import "@fontsource/pretendard" 1개로 통합 (빌드 37ms). 썸네일 최적화 — case/[slug].astro의 img 태그를 astro:assets Picture 컴포넌트로 전환, AVIF/WebP 자동 포맷 생성 설정 (formats: ['avif', 'webp']). lazy 로딩 — Picture 컴포넌트에 loading="lazy" 속성 적용하여 스크롤 시 로딩으로 초기 로드 시간 절감. Vercel Image Optimization — astro.config.mjs에 adapter: vercel({ imageService: true }) 및 output: 'static' 설정하여 Vercel CDN 기반 이미지 최적화 파이프라인 활성화 (빌드 128ms, static 파일 복사 정상). 전체 빌드 성공 확인: npm run build exit 0.

## ✅ Definition of Done (DoD)

> **작성 규칙**: 사람이 개입해야 하는 수동 스모크 테스트(Manual Smoke Test) 작성을 금지합니다.
> 모든 DoD 항목은 기계적으로 자동 검증 가능한 형태로 작성하되, 실행할 명령어는 **반드시 백틱(\`)으로 감싸서** 리스트 항목으로 작성하세요. `[ ]` 체크리스트 포맷은 사용하지 마세요.
> **Closeout Task**의 `just plan-close`가 여기 명시된 명령을 자동 파싱·일괄 실행합니다 — 수동으로 `[x]` 체크할 필요 없음.

- `npm run build`
- `just plan-lint docs/plans/PLAN_performance_optimization.md`

## 검증 행렬

| Scope | Command |
| :--- | :--- |
| Blueprint | `just plan-lint docs/plans/PLAN_performance_optimization.md` |

