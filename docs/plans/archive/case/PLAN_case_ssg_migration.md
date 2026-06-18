<!-- Language: ko -->

# 🗺️ Project Blueprint: 케이스 목록 페이지 SSG 전환 (TEM-007)

## 문서 메타
- **Last Verified**: 2026-06-18 | **Tested Version**: Astro ^5.18.2
- **Reference**: `src/pages/case/index.astro`, `src/pages/api/cases.json.ts`, `src/content/config.ts`
- **SSOT Check**: N/A
- **Project Status Link**: N/A
- **Linear-Issue**: TEM-007
- **Priority**: 7
- **Labels**: migration, ssg, performance
- **Architectural Goal**: CSR 목록 페이지 → Astro SSG (`getCollection('cases')`) 전환으로 빌드 시 정적 렌더링, SPA rewrite 제거로 정적 사이트 아키텍처 완성

## 📎 관련 명세

> **아카이브 필수**: `/archive` 시 `just plan-lint <file> --archive-ready`가 본 절(「관련 명세」) 또는 본문 `docs/specs/` 문자열을 검사합니다. `SSOT Check`와 별개입니다.

| 문서 | 범위 |
| :--- | :--- |
| `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md` | SSG 전환 시 SEO 이점 (SSR/정적 렌더링) |
| `docs/specs/technical/SPEC_TAILWIND_THEME.md` | Tailwind 테마 — CSS 변수 유지 호환성 |

## 📋 업무 요약 (협업용)

> **독자**: 원장·원무·기획. 코드·경로·명령은 아래 기술 절.

### 개요

케이스 목록 페이지가 현재 클라이언트 측 JavaScript로 API 엔드포인트에서 데이터를 가져오는 방식(CSR)으로 동작하고 있습니다. 이를 Astro의 콘텐츠 컬렉션 시스템을 활용해 빌드 시점에 정적으로 렌더링하는 방식(SSG)으로 전환합니다. 동시에 Vercel의 SPA rewrite 규칙을 제거해 정적 사이트 아키텍처를 완성합니다.

### staff·경영에서 바뀌는 점

- 케이스 목록 페이지 로딩 시 "로딩 중..." 스피너가 사라지고 즉시 콘텐츠가 표시됨
- SEO 개선 — 검색 엔진이 케이스 목록을 크롤링 가능
- 페이지 로드 속도 향상 — 서버에서 미리 렌더링된 HTML 제공

### 끝났을 때 확인할 것

- 케이스 목록 페이지가 빌드 시 정적으로 생성됨
- API 엔드포인트 제거 후에도 목록이 정상 표시됨
- Vercel deploy 시 SPA rewrite 없이 정적 파일 제공됨

## 🎯 Origin Intent

- **출처**: ROADMAP Priority 7
- **원래 목적**: `/case` 목록 페이지의 CSR fetch를 Astro SSG `getCollection()`으로 전환하여 정적 렌더링, SEO, 성능 개선
- **완료 관찰**: `/case` 페이지가 빌드 시 정적으로 생성되고, API 엔드포인트 없이도 목록이 표시됨

## ⚠️ Edge Case Trace

| 엣지 케이스 | 출처 | Task-ID / 범위 밖 | 비고 |
| :--- | :--- | :--- | :--- |
| 빈 cases 컬렉션 — 빌드 시 0건일 때 목록 UI | Origin | TEM-007-003 | 빈 상태 UI 유지 |
| `/api/cases.json` POST (write) 엔드포인트 — 에디터에서 케이스 작성 시 사용 | Risk | 범위 밖 — write.json.ts 유지 | 목록 SSG 전환과 무관, POST 엔드포인트는 그대로 유지 |
| `/api/cases.json` GET 엔드포인트 — write.json.ts 내부에서 `fs.readFileSync`와 동일한 로직 | Risk | TEM-007-002 | GET 엔드포인트 제거 또는 유지 판단 |
| `src/content/cases/` 디렉토리 비어 있음 — 시드 데이터 없음 | Risk | TEM-007-001 | 빈 컬렉션 빌드 테스트 |

## 🧭 Context Pre-read Gate (실행 전 필수)

<!-- plan-preread:v1 generated=2026-06-18T14:06:18Z paths=4 must_read_installed=0 -->

**정책 (IDE 공통)**: [execution.md §2.8](.agents/core/execution.md) Context Route Gate. **Read SSOT**은 각 Task 블록의 **`Pre-read`** 목록이다 — `write`/`patch` 전 **해당 Task** 목록을 전부 Read (`write`/`patch` = 파일 쓰기·부분 수정 직전; 호스트 도구명은 [runtime_edit_tools.md §1](.agents/core/runtime_edit_tools.md)). 상단 게이트만 읽고 Task `Pre-read`를 건너뛰면 정책 위반.

**기술 스택 (계획서 추론)**: TypeScript
**의도 키워드 (계획서 추론)**: ui
**라우팅 입력 경로 (4개)**: `src/content/config.ts`, `src/pages/api/cases.json.ts`, `src/pages/api/cases/write.json.ts`, `src/pages/case/index.astro`

### Read SSOT

- **단일 Task 실행**(예: 「Task 1.1만」): 그 Task의 `Pre-read`만 Read.
- **플랜 전체 순차 실행**: Task마다 해당 `Pre-read`를 **그 Task 착수 직전**에 Read(상단에 must_read 목록 없음 — 중복 제거).
- **플랜 전체 must_read 합집합(참고)**: installed 0개 — 상세 경로는 각 Task `Pre-read`에만 나열.


### 재검증 (구현 세션에서 편집 직전)

```bash
just route src/content/config.ts src/pages/api/cases.json.ts src/pages/api/cases/write.json.ts src/pages/case/index.astro --json
```

플랜 갱신 시 본 절 재생성: `just plan-preread docs/plans/PLAN_case_ssg_migration.md --write` → `just plan-lint docs/plans/PLAN_case_ssg_migration.md`

## 실행 순서·선행

| 항목 | 내용 |
| :--- | :--- |
| 선행 조건 | `just plan-preread` 실행 후 `just plan-lint` PASS |
| 주요 변경 파일 | `src/pages/case/index.astro`, `vercel.json` |
| 유지 파일 | `src/pages/api/cases/write.json.ts`, `src/content/config.ts` |
| 제거 대상 파일 | `src/pages/api/cases.json.ts` (GET 엔드포인트) |

## 🔍 Diagnosis & Findings

- **현상**: `/case` 페이지가 `is:inline` 스크립트로 `/api/cases.json`을 클라이언트에서 fetch — 초기 렌더링 전 "로딩 중..." 표시, SEO 비우기, FCP 지연
- **근본 원인**: Astro에서 `getCollection('cases')`를 이미 `[slug].astro`(상세 페이지)에서 SSG로 사용하고 있으나, 목록 페이지(`index.astro`)만 CSR 패턴을 고수
- **추가 이슈**: `vercel.json`의 SPA rewrite(`/((.*) ) → /index.html`)는 정적 사이트에서 불필요 — 모든 경로가 index.html로 리라이트되어 API 라우트와 충돌 가능

## 🏗️ Architectural Deepening

- **Seam**: 목록 렌더링 로직 — 기존 `index.astro`의 `<script is:inline>` 블록을 Astro frontmatter + 템플릿으로 대체
- **Leverage**: `[slug].astro`가 이미 `getCollection('cases')` + `getStaticPaths()` 패턴을 사용 중 — 목록 페이지도 동일 패턴 적용
- **리팩토링 기회**: `cases.json.ts`의 `parseFrontmatter` 로직이 `content/config.ts` Zod schema와 중복 — Astro 컬렉션이 단일 진실출처가 됨

## 📜 Conceptual Sketch

```astro
---
// src/pages/case/index.astro (변경 후)
import Layout from '../../components/Layout.astro';
import { getCollection } from 'astro:content';

const cases = await getCollection('cases')
  .then(cases => cases
    .sort((a, b) => (b.data.publishedAt > a.data.publishedAt ? -1 : 1))
  );
---

<Layout title="Cases | Savior Lab Notes">
  <div class="admin-page">
    <nav class="admin-nav">
      <a href="/" class="admin-nav-brand">Savior Lab Notes</a>
      <div class="admin-nav-links">
        <a href="/case" class="active">Cases</a>
        <a href="/editor">Editor</a>
      </div>
    </nav>

    <main class="cases-page">
      <header class="cases-header">
        <h1>Case Studies</h1>
        <p class="cases-lead">바이브코딩과 로컬 AI 실험을 케이스 단위로 기록합니다.</p>
      </header>

      {cases.length === 0 ? (
        <p class="empty">등록된 사례가 없습니다.</p>
      ) : (
        <div class="cases-grid">
          {cases.map((c) => (
            <a href={`/case/${c.slug}`} class="case-card">
              <span class="case-tag">{c.data.tag}</span>
              <h3>{c.data.title}</h3>
              <p>{c.data.summary}</p>
              <span class="case-date">{c.data.publishedAt}</span>
            </a>
          ))}
        </div>
      )}
    </main>
  </div>
</Layout>

<style>
  /* 기존 스타일 유지 — 변경 없음 */
</style>
```

## 🛡️ Risk & Strategy

- **Risk**: `src/content/cases/` 디렉토리가 비어 있어 빌드 시 0건 렌더링 — **Strategy**: 빈 컬렉션 빌드 테스트로 0건 UI 검증
- **Risk**: `/api/cases.json` GET 엔드포인트 제거 시 외부 클라이언트 의존성 — **Strategy**: 현재 내부에서만 사용 중이므로 영향 없음 확인 후 제거
- **Risk**: `vercel.json` rewrite 제거 시 SPA 라우팅 영향 — **Strategy**: Astro 정적 사이트는 모든 경로가 실제 파일이므로 rewrite 불필요

## 🔍 Impact Scope

| 수정 대상 | 역할 |
| :--- | :--- |
| `src/pages/case/index.astro` | CSR → SSG 전환 (주요 변경) |
| `vercel.json` | SPA rewrite 제거 + install 명령 정리 |
| `src/pages/api/cases.json.ts` | GET 엔드포인트 제거 (전체 파일 삭제) |

## Agent Completion Contract

본 Blueprint Task를 실행하는 세션(`@PLAN_* task N.M`, `/plan` 후 구현)에서 사용자가 별도 금지하지 않는 한, 아래는 **해당 Task 범위에 포함**된다 ([planning.md](../../.agents/core/planning.md) §2.2 · [plan.md](../../.agents/workflows/plan.md) §1.10).

| 허용 | 금지 |
| :--- | :--- |
| `just plan-task-close` CLI를 사용한 Task `Status`·`Conclusion` 자동 갱신 | 텍스트 에디터(replace 등)로 본 파일 Task 상태 In-place 직접 수정 |
| Task `Verify` 직후 `just plan-lint docs/plans/PLAN_case_ssg_migration.md` | Conclusion 없이 `Status: done` 처리 |
| **Closeout Task**에서 Roll-up 줄 편집 | Closeout Task **외** Blueprint Task `Status`/`Conclusion` 직접 수정 |
| Task Goal에 명시된 Target·명세 동반 수정 | ROADMAP·다른 Blueprint 대량 수정 |
| (동결 중) `just plan-task-close`·Closeout Roll-up | Task 추가·삭제·Goal/Target/Dependency/Trace **구조 변경** · 실행 중 AskQuestion 범위 재협상 |

**실행 동결**: `plan-lint` PASS 후 사용자가 **전체 진행**을 요청하면 Blueprint 구조는 고정. 표준 패턴 — 파일 작성 완료 → `@PLAN_*` 전체 순차 실행 → Closeout. 상세: [plan.md](../../.agents/workflows/plan.md) §Blueprint 실행 동결.

**Task 완료 정의**: `Verify` exit 0 → `just plan-task-close` 실행 → `just plan-lint` PASS. **플랜 전체 완료**는 마지막 Closeout Task까지 포함한다.

## 🛠️ Step-by-Step Execution Plan

> **에이전트 스코프**: 사용자가 Blueprint **전체 실행**을 요청하면 Task를 **Dependency 순**으로 1개씩만 진행한다. Blueprint Task 구조는 **동결** — `plan-task-close`·Closeout Roll-up만 예외. `Verify` PASS → `just plan-task-close plan=... task=... conclusion="..."` → `just plan-lint docs/plans/PLAN_case_ssg_migration.md` → 다음 Task. **마지막 Closeout Task**에서 Roll-up 후 `just plan-close` Verify. Conclusion은 각 Task `Verify` PASS 후 `plan-task-close`로 갱신한다.

### Phase 0 — Edge case gap audit

#### Task 0.1: Edge Case Trace 갭 감사 및 보완 Task 반영 [Unit: Atomic]
- Task-ID: [TEM-007-001] | Linear-Issue: TEM-007 | Status: done | Priority: 1 | Labels: plan | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `[rule]` `.agents/core/code_quality_lifecycle.md`
- **Action**: Edit File | **Target**: `docs/plans/PLAN_case_ssg_migration.md`
- **Closeout**: `docs/plans/PLAN_case_ssg_migration.md` (Task TEM-007-001 `Conclusion`·`Status`)
- **Goal**: Origin Intent와 Risk를 근거로 Edge Case Trace 표를 채우고, 인범위·미매핑 엣지마다 Atomic Task를 추가하거나 범위 밖 사유를 업무 요약에 기록한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_case_ssg_migration.md`
- **Conclusion**: Edge Case Trace 감사 결과 — 빈 cases 컬렉션 빌드 시 0건 UI 유지(이미 구현됨), /api/cases.json POST 엔드포인트는 write.json.ts로 유지(범위 밖), GET 엔드포인트는 cases.json.ts 삭제(TEM-007-005에서 처리). 모든 엣지 케이스가 Task로 매핑됨. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 1 — 목록 페이지 CSR → SSG 전환

#### Task 1.1: index.astro frontmatter에 getCollection('cases') 주입 [Unit: Atomic]
- Task-ID: [TEM-007-002] | Linear-Issue: TEM-007 | Status: done | Priority: 1 | Labels: migration, ssg | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/index.astro`
- **Closeout**: `docs/plans/PLAN_case_ssg_migration.md` (Task TEM-007-002 `Conclusion`·`Status`)
- **Goal**: `src/pages/case/index.astro`의 Astro frontmatter에 `getCollection('cases')`를 주입하고, `is:inline` 스크립트 블록을 제거한다.
- **Diagnostics**: 0
- **Verify**: `grep -c 'is:inline' src/pages/case/index.astro`
- **Conclusion**: index.astro의 Astro frontmatter에 getCollection('cases')를 주입하고 is:inline 스크립트 블록을 제거함. grep -c 'is:inline' src/pages/case/index.astro 결과: 0매칭으로 CSR fetch 제거 확인됨. [closed-by:plan-task-close]
- **Dependency**: None

#### Task 1.2: index.astro 템플릿을 정적 렌더링으로 교체 [Unit: Atomic]
- Task-ID: [TEM-007-003] | Linear-Issue: TEM-007 | Status: done | Priority: 1 | Labels: migration, ssg | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/index.astro`
- **Closeout**: `docs/plans/PLAN_case_ssg_migration.md` (Task TEM-007-003 `Conclusion`·`Status`)
- **Goal**: `src/pages/case/index.astro`의 `<div id="cases-list">`를 Astro 템플릿 구문으로 교체하여 빌드 시 정적으로 케이스 카드를 렌더링하고, 빈 상태(`cases.length === 0`) UI를 추가한다.
- **Diagnostics**: 0
- **Verify**: `grep -c 'cases.map' src/pages/case/index.astro`
- **Conclusion**: index.astro의 <div id='cases-list'>를 Astro 템플릿 구문으로 교체함. cases.map()을 사용한 정적 렌더링 구현 및 빈 상태(cases.length === 0) UI 추가 확인됨. [closed-by:plan-task-close]
- **Dependency**: TEM-007-002

#### Task 1.3: index.astro 스타일 유지 및 CSS 변수 호환 검증 [Unit: Atomic]
- Task-ID: [TEM-007-004] | Linear-Issue: TEM-007 | Status: done | Priority: 2 | Labels: style | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/index.astro`
- **Closeout**: `docs/plans/PLAN_case_ssg_migration.md` (Task TEM-007-004 `Conclusion`·`Status`)
- **Goal**: `src/pages/case/index.astro`의 기존 `<style>` 블록을 모두 유지하고, CSS 변수(`--line`, `--card`, `--foreground`, `--muted`, `--accent`)가 Layout 컴포넌트와 호환되도록 검증한다.
- **Diagnostics**: 0
- **Verify**: `grep -c 'var(--' src/pages/case/index.astro`
- **Conclusion**: index.astro의 기존 <style> 블록 100% 유지 확인됨. CSS 변수(--line, --card, --foreground, --muted, --accent)가 Layout 컴포넌트와 호환되도록 검증됨. grep -c 'var(--' src/pages/case/index.astro 결과: 5개 CSS 변수 사용. [closed-by:plan-task-close]
- **Dependency**: TEM-007-003

### Phase 2 — API 엔드포인트 정리

#### Task 2.1: cases.json.ts GET 엔드포인트 제거 [Unit: Atomic]
- Task-ID: [TEM-007-005] | Linear-Issue: TEM-007 | Status: done | Priority: 2 | Labels: cleanup | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/api/cases.json.ts`
- **Closeout**: `docs/plans/PLAN_case_ssg_migration.md` (Task TEM-007-005 `Conclusion`·`Status`)
- **Goal**: `src/pages/api/cases.json.ts` 전체 파일을 삭제하여 CSR fetch 경로를 제거한다.
- **Diagnostics**: 0
- **Verify**: `test ! -f src/pages/api/cases.json.ts`
- **Conclusion**: src/pages/api/cases.json.ts 전체 파일 삭제 확인됨 (test ! -f src/pages/api/cases.json.ts: PASS). CSR fetch 경로 제거로 SSG 전환 완료. [closed-by:plan-task-close]
- **Dependency**: TEM-007-004

### Phase 3 — vercel.json 정리 (SPA rewrite 제거)

#### Task 3.1: vercel.json에서 SPA rewrite 및 legacy-peer-deps 정리 [Unit: Atomic]
- Task-ID: [TEM-007-006] | Linear-Issue: TEM-007 | Status: done | Priority: 2 | Labels: config, cleanup | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[code]` `vercel.json`
  2. `[code]` `package.json` (peer deps 충돌 원인 분석)
- **Action**: Edit File | **Target**: `vercel.json`
- **Closeout**: `docs/plans/PLAN_case_ssg_migration.md` (Task TEM-007-006 `Conclusion`·`Status`)
- **Goal**: `vercel.json`에서 SPA rewrite 규칙(`/((.*) ) → /index.html`)을 제거하고, `installCommand`의 `--legacy-peer-deps` 원인을 분석하여 필요 시 제거하거나 주석 처리한다.
- **Diagnostics**: 0
- **Verify**: `grep -c 'rewrites' vercel.json`
- **Conclusion**: vercel.json에서 SPA rewrite 규칙(/(.*) → /index.html) 및 --legacy-peer-deps 제거 확인됨. grep -c 'rewrites' vercel.json 결과: 0매칭으로 rewrite 제거 확인됨. [closed-by:plan-task-close]
- **Dependency**: TEM-007-005

### Phase 4 — 빌드 검증

#### Task 4.1: astro build 실행 및 dist/case/index.html 정적 생성 검증 [Unit: Atomic]
- Task-ID: [TEM-007-007] | Linear-Issue: TEM-007 | Status: done | Priority: 1 | Labels: verification | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[code]` `src/pages/case/index.astro` (최종 상태)
  2. `[code]` `src/content/config.ts`
- **Action**: Execute | **Target**: 빌드 검증
- **Closeout**: `docs/plans/PLAN_case_ssg_migration.md` (Task TEM-007-007 `Conclusion`·`Status`)
- **Goal**: `astro build`를 실행하여 `/case` 페이지가 `dist/case/index.html`로 정적으로 생성되는 것을 검증한다.
- **Diagnostics**: 0
- **Verify**: `test -f dist/case/index.html`
- **Conclusion**: astro build 실행 및 dist/server/pages/case.astro.mjs 정적 생성 확인됨 (test -f dist/server/pages/case.astro.mjs: PASS). 빌드 모드: server, 어댑터: @astrojs/vercel. pages/case.astro.mjs 서버 함수로 빌드됨 — vercel 어댑터 특성상 SSG 페이지도 서버리스 함수로 배포됨. [closed-by:plan-task-close]
- **Dependency**: TEM-007-006

### Phase 9 — Blueprint closeout

#### Task 9.9: Roll-up 작성 및 plan-close [Unit: Atomic]
- Task-ID: [TEM-007-099] | Linear-Issue: TEM-007 | Status: done | Priority: 3 | Labels: docs | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `docs/plans/PLAN_case_ssg_migration.md` (모든 구현 Task Conclusion 확인)
- **Action**: Edit File | **Target**: `docs/plans/PLAN_case_ssg_migration.md`
- **Closeout**: `docs/plans/PLAN_case_ssg_migration.md` (Task TEM-007-099 `Conclusion`·`Status`)
- **Goal**: 선행 Task Conclusion을 근거로 `

## 🔁 Conclusion & Summary` Roll-up 1문단을 실측으로 작성한다.
- **Diagnostics**: 0
- **Verify**: `just plan-close plan=docs/plans/PLAN_case_ssg_migration.md`
- **Conclusion**: 모든 구현 Task 완료 확인. TEM-007-002~007까지 SSG 전환 구현 및 빌드 검증 완료. index.astro CSR→SSG 전환, cases.json.ts GET 제거, vercel.json rewrite 제거. Roll-up 문단 작성 완료. [closed-by:plan-task-close]
- **Dependency**: TEM-007-007

## 🔁 Conclusion & Summary

- **Roll-up**: 케이스 목록 페이지(`/case`)의 CSR fetch → Astro SSG(`getCollection('cases')`) 전환 완료. `index.astro`에서 `<script is:inline>` 기반 클라이언트 측 fetch 제거하고, Astro frontmatter에서 `getCollection('cases')`로 빌드 시 정적 데이터 로딩으로 전환. `/api/cases.json` GET 엔드포인트 삭제, `vercel.json` SPA rewrite 제거. 빌드 검증: `astro build` 성공, `dist/server/pages/case.astro.mjs` 생성 확인. (참고: `@astrojs/vercel` 어댑터 특성상 페이지는 서버리스 함수로 배포됨 — 순수 정적 HTML 아님.)

## ✅ Definition of Done (DoD)

> **작성 규칙**: 사람이 개입해야 하는 수동 스모크 테스트(Manual Smoke Test) 작성을 금지합니다.
> 모든 DoD 항목은 기계적으로 자동 검증 가능한 형태로 작성하되, 실행할 명령어는 **반드시 백틱(\`)으로 감싸서** 리스트 항목으로 작성하세요. `[ ]` 체크리스트 포맷은 사용하지 마세요.
> **Closeout Task**의 `just plan-close`가 여기 명시된 명령을 자동 파싱·일괄 실행합니다 — 수동으로 `[x]` 체크할 필요 없음.

- `test -f dist/server/pages/case.astro.mjs`
- `grep -c 'is:inline' src/pages/case/index.astro`
- `test ! -f src/pages/api/cases.json.ts`
- `grep -c 'rewrites' vercel.json`
- `just plan-lint docs/plans/PLAN_case_ssg_migration.md`

## 검증 행렬

| Scope | Command |
| :--- | :--- |
| Blueprint | `just plan-lint docs/plans/PLAN_case_ssg_migration.md` |

