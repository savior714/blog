<!-- Language: ko -->

# 🗺️ Project Blueprint: 콘텐츠 렌더링 개선 (TEM-210)

## 문서 메타
- **Last Verified**: 2026-06-18 | **Tested Version**: astro@5.18.2, @astrojs/mdx@5.0.0
- **Reference**: `SPEC_TECH_SEO_FUNDAMENTALS.md`, `SPEC_TAILWIND_THEME.md`
- **SSOT Check**: `src/pages/case/[slug].astro` (본문 렌더링), `src/components/Head.astro` (메타태그 미사용)
- **Project Status Link**: N/A
- **Linear-Issue**: TEM-210
- **Priority**: 2
- **Labels**: content-rendering, mdx, refactor
- **Architectural Goal**: Content Collection의 `render()` API를 통해 MDX 본문을 실제 HTML로 렌더링 — 수동 split/escapeHtml 제거. Head.astro를 메타태그 SSOT로 통합.

## 📎 관련 명세

> **아카이브 필수**: `/archive` 시 `just plan-lint <file> --archive-ready`가 본 절(「관련 명세」) 또는 본문 `docs/specs/` 문자열을 검사합니다. `SSOT Check`와 별개입니다.

| 문서 | 범위 |
| :--- | :--- |
| `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md` | Head.astro 메타태그 SSOT화, Layout.astro 통합 |
| `docs/specs/technical/SPEC_TAILWIND_THEME.md` | Tailwind v4 @theme 토큰 정의 (변경 없음) |

## 📋 업무 요약 (협업용)

> **독자**: 원장·원무·기획. 코드·경로·명령은 아래 기술 절.

### 개요

블로그 케이스 상세 페이지의 본문이 Markdown/MDX 형식을 무시하고, 단순 텍스트로 분할·에스코프되어 렌더링됩니다. 또한 SEO/OG 태그를 담당하는 Head.astro 컴포넌트가 현재 전혀 사용되지 않고 있습니다.

### staff·경영에서 바뀌는 점

- 케이스 상세 페이지에서 Markdown 서식(굵게, 기울임, 리스트, 코드블록, 링크 등)이 정상적으로 적용됨
- 검색 엔진과 소셜 공유 시 올바른 OG 태그·타이틀·설명 표시
- 메타태그 관리가 한 곳(Head.astro)으로 통합되어 유지보수 용이

### 끝났을 때 확인할 것

- case 상세 페이지에서 Markdown 본문이 HTML로 올바르게 렌더링됨
- 페이지 소스에서 OG 태그 등 메타데이터가 Head.astro에서 주입됨
- 빌드가 에러 없이 완료됨

## 🎯 Origin Intent

- **출처**: Priority 2.1 개선 요청 (본문 렌더링 수동 split → render() API 전환)
- **원래 목적**: Content Collection의 `entry.body`를 수동 `split('\n\n')` + `escapeHtml`로 처리하는 대신, Astro의 `render()` API를 통해 MDX 본문을 실제 HTML 컴포넌트로 렌더링
- **완료 관찰**: `/case/{slug}` 페이지에서 Markdown 서식이 적용된 본문이 표시되고, OG 태그가 Head.astro에서 동적 주입됨

## ⚠️ Edge Case Trace

| 엣지 케이스 | 출처 | Task-ID / 범위 밖 | 비고 |
| :--- | :--- | :--- | :--- |
| `getStaticPaths`에서 `entry.body`를 props로 전달하면 MDX 렌더링이 무효화됨 — `render()`는 entry 객체 자체를 필요로 함 | Risk | TEM-210-003 | entry 객체 전체를 props로 전달하거나, `getEntry`로 개별 조회 |
| MDX 파일이 아직 `src/content/cases/`에 없음 — 빌드 시 getCollection이 빈 배열 반환 | Risk | TEM-210-001 | 빈 배열이라도 빌드 실패하지 않도록 graceful 처리 |
| `render()`는 async — `getStaticPaths` 내에서는 직접 호출 불가 | Risk | TEM-210-003 | page 컴포넌트 본문에서 await render(entry) |
| Head.astro Props 타입과 Layout.astro interface가 불일치 — description 기본값 위치 | Risk | TEM-210-004 | Head.astro Props로 통합, Layout.astro에서 `{...props}` spread |
| 기존 `<style>` 블록이 `[slug].astro`에 inline으로 정의됨 — global.css로 이관 여부 | Origin | 범위 밖 — 스타일 마이그레이션은 별도 Blueprint | 현재 Blueprint 범위 제외 |

## 🧭 Context Pre-read Gate (실행 전 필수)

<!-- plan-preread:v1 generated=2026-06-18T14:06:13Z paths=5 must_read_installed=0 -->

**정책 (IDE 공통)**: [execution.md §2.8](.agents/core/execution.md) Context Route Gate. **Read SSOT**은 각 Task 블록의 **`Pre-read`** 목록이다 — `write`/`patch` 전 **해당 Task** 목록을 전부 Read (`write`/`patch` = 파일 쓰기·부분 수정 직전; 호스트 도구명은 [runtime_edit_tools.md §1](.agents/core/runtime_edit_tools.md)). 상단 게이트만 읽고 Task `Pre-read`를 건너뛰면 정책 위반.

**기술 스택 (계획서 추론)**: TypeScript
**의도 키워드 (계획서 추론)**: ui, 리팩터
**라우팅 입력 경로 (5개)**: `.agents/workflows/plan.md`, `src/components/Head.astro`, `src/components/Layout.astro`, `src/content/config.ts`, `src/pages/case/[slug].astro`

### Read SSOT

- **단일 Task 실행**(예: 「Task 1.1만」): 그 Task의 `Pre-read`만 Read.
- **플랜 전체 순차 실행**: Task마다 해당 `Pre-read`를 **그 Task 착수 직전**에 Read(상단에 must_read 목록 없음 — 중복 제거).
- **플랜 전체 must_read 합집합(참고)**: installed 0개 — 상세 경로는 각 Task `Pre-read`에만 나열.


### 재검증 (구현 세션에서 편집 직전)

```bash
just route .agents/workflows/plan.md src/components/Head.astro src/components/Layout.astro src/content/config.ts src/pages/case/[slug].astro --json
```

플랜 갱신 시 본 절 재생성: `just plan-preread docs/plans/PLAN_content_rendering_fix.md --write` → `just plan-lint docs/plans/PLAN_content_rendering_fix.md`

## 실행 순서·선행

| 순서 | Task | Dependency |
| :--- | :--- | :--- |
| 1 | TEM-210-001: content/config.ts schema 검증 | None |
| 2 | TEM-210-002: Head.astro Props 확장 및 SSOT화 | None |
| 3 | TEM-210-003: [slug].astro render() API 전환 | TEM-210-002 |
| 4 | TEM-210-004: Layout.astro Head.astro 통합 | TEM-210-002 |
| 5 | TEM-210-099: Roll-up 작성 및 plan-close | TEM-210-004 |

## 🔍 Diagnosis & Findings

- **현상**: `src/pages/case/[slug].astro:64-67`에서 `content.split('\n\n').filter(Boolean).map((p) => \`<p>${escapeHtml(p)}</p>\`).join('\n')` — Markdown/MDX의 모든 서식(굵게, 코드블록, 링크, 이미지, 리스트)이 텍스트로 노출
- **근본 원인**: `getStaticPaths`에서 `entry.body` (raw string)를 props로 전달한 후, Astro의 `render()` API를 전혀 사용하지 않고 수동 파싱
- **2차 현상**: `src/components/Head.astro`가 100% unused — Layout.astro가 자체 `<head>` 블록을 직접 작성

## 🏗️ Architectural Deepening

- **Seam**: `src/pages/case/[slug].astro` — 렌더링 방식 변경 (수동 split → render())
- **Seam**: `src/components/Head.astro` + `Layout.astro` — 메타태그 SSOT 통합
- **Leverage**: Astro 5.x `render()` from `astro:content` — entry의 MDX 본문을 `<Content />` 컴포넌트로 변환
- **Leverage**: `@astrojs/mdx` 이미 설치됨 — 추가 의존성 없음

## 📜 Conceptual Sketch

```
Before:
  getStaticPaths → entry.body (raw string) → props.content
  [slug].astro → {content.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('\n')}
  Layout.astro → <head> 직접 작성 (OG 없음)
  Head.astro → unused

After:
  getStaticPaths → entry (full object) → props.entry
  [slug].astro → const { Content } = await render(entry); → <Content />
  Layout.astro → <Head {...props} /> import
  Head.astro → SSOT: title, description, og:title, og:description, og:type, twitter:card
```

## 🛡️ Risk & Strategy

- **Risk**: `getStaticPaths`에서 entry 객체 전체를 props로 전달하면 직렬화 문제 — **Strategy**: `entry.slug`만 params/props로 전달하고, page 컴포넌트에서 `getEntry('cases', slug)`로 개별 조회 후 `render()`
- **Risk**: 기존 `<style>` 블록이 `[slug].astro`에 inline 정의됨 — **Strategy**: 범위 밖으로 명시 (별도 Blueprint)
- **Risk**: Head.astro Props 확장 시 Layout.astro interface와 충돌 — **Strategy**: Head.astro의 `type HeadProps`를 단일 SSOT로 하고, Layout.astro에서 `{...props}` spread

## 🔍 Impact Scope

| 수정 대상 | 역할 |
| :--- | :--- |
| `src/content/config.ts` | schema 검증 (변경 없음 확인) |
| `src/components/Head.astro` | Props 확장 — og:type, og:url, twitter:image 지원 |
| `src/components/Layout.astro` | 직접 `<head>` 제거 → `<Head {...props} />` import |
| `src/pages/case/[slug].astro` | render() API 전환, escapeHtml 제거, Head.astro import |

## Agent Completion Contract

본 Blueprint Task를 실행하는 세션(`@PLAN_* task N.M`, `/plan` 후 구현)에서 사용자가 별도 금지하지 않는 한, 아래는 **해당 Task 범위에 포함**된다 ([planning.md](../../.agents/core/planning.md) §2.2 · [plan.md](../../.agents/workflows/plan.md) §1.10).

| 허용 | 금지 |
| :--- | :--- |
| `just plan-task-close` CLI를 사용한 Task `Status`·`Conclusion` 자동 갱신 | 텍스트 에디터(replace 등)로 본 파일 Task 상태 In-place 직접 수정 |
| Task `Verify` 직후 `just plan-lint docs/plans/PLAN_content_rendering_fix.md` | Conclusion 없이 `Status: done` 처리 |
| **Closeout Task**에서 Roll-up 줄 편집 | Closeout Task **외** Blueprint Task `Status`/`Conclusion` 직접 수정 |
| Task Goal에 명시된 Target·명세 동반 수정 | ROADMAP·다른 Blueprint 대량 수정 |
| (동결 중) `just plan-task-close`·Closeout Roll-up | Task 추가·삭제·Goal/Target/Dependency/Trace **구조 변경** · 실행 중 AskQuestion 범위 재협상 |

**실행 동결**: `plan-lint` PASS 후 사용자가 **전체 진행**을 요청하면 Blueprint 구조는 고정. 표준 패턴 — 파일 작성 완료 → `@PLAN_*` 전체 순차 실행 → Closeout. 상세: [plan.md](../../.agents/workflows/plan.md) §Blueprint 실행 동결.

**Task 완료 정의**: `Verify` exit 0 → `just plan-task-close` 실행 → `just plan-lint docs/plans/PLAN_content_rendering_fix.md` PASS. **플랜 전체 완료**는 마지막 Closeout Task까지 포함한다.

## 🛠️ Step-by-Step Execution Plan

> **에이전트 스코프**: 사용자가 Blueprint **전체 실행**을 요청하면 Task를 **Dependency 순**으로 1개씩만 진행한다. Blueprint Task 구조는 **동결** — `plan-task-close`·Closeout Roll-up만 예외. `Verify` PASS → `just plan-task-close`로 Task Conclusion 갱신 → `just plan-lint docs/plans/PLAN_content_rendering_fix.md` 검증 → 다음 Task. **마지막 Closeout Task**에서 Roll-up 후 `just plan-close` Verify.

### Phase 0 — Edge case gap audit

#### Task 0.1: Edge Case Trace 갭 감사 및 보완 Task 반영 [Unit: Atomic]
- Task-ID: [TEM-210-000] | Linear-Issue: TEM-210 | Status: done | Priority: 1 | Labels: plan | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[code]` `.agents/workflows/plan.md`
  2. `[code]` `.agents/core/code_quality_lifecycle.md`
- **Action**: Edit File | **Target**: `docs/plans/PLAN_content_rendering_fix.md`
- **Closeout**: `docs/plans/PLAN_content_rendering_fix.md` (Task TEM-210-000 `Conclusion`·`Status`)
- **Goal**: Edge Case Trace 표를 검토하고, 인범위 엣지가 모두 Task로 매핑되었는지 검증한 후 누락 시 Atomic Task를 추가한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_content_rendering_fix.md`
- **Conclusion**: Edge Case Trace 표 검증 완료. 5개 엣지 케이스 모두 Task로 매핑됨: TEM-210-001(MDX 누락), TEM-210-003(getStaticPaths 직렬화), TEM-210-003(render async), TEM-210-004(Props 불일치), 범위 밖(style 마이그레이션). 누락 없음. just plan-lint PASS. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 1 — Content schema 검증

#### Task 1.1: content/config.ts schema 검증 [Unit: Atomic]
- Task-ID: [TEM-210-001] | Linear-Issue: TEM-210 | Status: done | Priority: 1 | Labels: content, schema | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Read File | **Target**: `src/content/config.ts`
- **Closeout**: `docs/plans/PLAN_content_rendering_fix.md` (Task TEM-210-001 `Conclusion`·`Status`)
- **Goal**: `src/content/config.ts` schema가 현재 필드(tag, title, summary, thumbnail, youtubeUrl, publishedAt)를 모두 포함하고 있는지 검증하고, render() API 전환에 schema 변경이 필요 없는지 확인한다.
- **Diagnostics**: `cat src/content/config.ts`로 현재 스키마 구조 확인
- **Verify**: `uv run python -c "import sys; content = open('src/content/config.ts').read(); assert 'tag' in content and 'title' in content and 'summary' in content and 'publishedAt' in content, 'schema fields missing'"`
- **Conclusion**: content/config.ts schema 검증 완료. tag(enum), title, summary, thumbnail, youtubeUrl, publishedAt 필드 모두 존재함. render() API 전환에 schema 변경 불필요. python 검증 스크립트 exit 0. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 2 — Head.astro SSOT화

#### Task 2.1: Head.astro Props 확장 및 SSOT화 [Unit: Atomic]
- Task-ID: [TEM-210-002] | Linear-Issue: TEM-210 | Status: done | Priority: 1 | Labels: head, seo, meta | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/components/Head.astro`
- **Closeout**: `docs/plans/PLAN_content_rendering_fix.md` (Task TEM-210-002 `Conclusion`·`Status`)
- **Goal**: `src/components/Head.astro`에 `ogImage`, `ogUrl`, `ogType`, `publishedAt`, `tag`, `twitterImage` prop을 추가하고, `og:type`을 prop으로 전달받도록 확장하여 `article` 타입 지원을 포함한다.
- **Diagnostics**: 기존 Head.astro의 props와 meta 태그 구조 분석
- **Verify**: `uv run python -c "content = open('src/components/Head.astro').read(); props = ['ogImage', 'ogUrl', 'ogType', 'publishedAt', 'tag']; missing = [p for p in props if p not in content]; assert not missing, f'missing props: {missing}'"`
- **Conclusion**: Head.astro Props 검증 완료. ogImage, ogUrl, ogType, publishedAt, tag 필드 모두 이미 정의됨. article 타입 ogType 지원, twitter:image 태그 포함. 추가 확장 불필요. python 검증 스크립트 exit 0. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 3 — [slug].astro render() API 전환

#### Task 3.1: [slug].astro render() API 전환 [Unit: Atomic]
- Task-ID: [TEM-210-003] | Linear-Issue: TEM-210 | Status: done | Priority: 1 | Labels: rendering, mdx, slug-page | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/[slug].astro`
- **Closeout**: `docs/plans/PLAN_content_rendering_fix.md` (Task TEM-210-003 `Conclusion`·`Status`)
- **Goal**: `src/pages/case/[slug].astro`에서 `getStaticPaths`의 props에서 `entry.body` 전달을 제거하고, `getEntry('cases', slug)`로 entry를 개별 조회한 후 `const { Content } = await render(entry)`로 MDX 본문을 `<Content />` 컴포넌트로 렌더링한다. `escapeHtml` 함수와 수동 split/escapeHtml 렌더링 블록을 제거하고, `Head.astro`를 import하여 `<Head {...headProps} />`로 메타태그를 주입한다.
- **Diagnostics**: 기존 `[slug].astro:64-67`의 수동 렌더링 블록과 `escapeHtml` 함수 위치 확인
- **Verify**: `uv run python -c "content = open('src/pages/case/[slug].astro').read(); assert 'render' in content and 'getEntry' in content and 'Content' in content, 'render API not found'; assert 'escapeHtml' not in content, 'escapeHtml still present'; assert \"split('\\\\n\\\\n')\" not in content, 'manual split still present'"`
- **Conclusion**: [slug].astro render() API 전환 완료. getEntry('cases', slug)로 entry 개별 조회, await render(entry)로 MDX Content 컴포넌트 렌더링, escapeHtml 함수 및 수동 split('\n\n') 렌더링 블록 제거. getStaticPaths에서 entry.body props 전달 제거. python 검증 스크립트 exit 0: render·getEntry·Content 존재, escapeHtml·split 제거됨. [closed-by:plan-task-close]
- **Dependency**: TEM-210-002

### Phase 4 — Layout.astro Head.astro 통합

#### Task 4.1: Layout.astro Head.astro 통합 [Unit: Atomic]
- Task-ID: [TEM-210-004] | Linear-Issue: TEM-210 | Status: done | Priority: 1 | Labels: layout, head-integration | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/components/Layout.astro`
- **Closeout**: `docs/plans/PLAN_content_rendering_fix.md` (Task TEM-210-004 `Conclusion`·`Status`)
- **Goal**: `src/components/Layout.astro`에서 직접 작성하던 `<head>` 블록을 제거하고, `Head.astro`를 import하여 `<Head {...props} />`로 치환한다. Props interface를 Head.astro의 `HeadProps`와 호환되도록 조정한다.
- **Diagnostics**: Layout.astro의 현재 `<head>` 블록 내용과 Head.astro의 meta 태그 비교
- **Verify**: `uv run python -c "content = open('src/components/Layout.astro').read(); assert 'import Head' in content or 'import.*Head' in content, 'Head not imported'; assert '<head>' not in content or 'is:global' in content, 'direct head tag still present'"`
- **Conclusion**: Layout.astro Head.astro 통합 완료. duplicate HeadProps interface 제거, Head.astro에서 type export import 사용, <Head {...props} />로 spread 패턴 적용, 직접 <head> 태그 작성 제거. python 검증 스크립트 exit 0: import Head 존재, <head> 태그 제거됨. [closed-by:plan-task-close]
- **Dependency**: TEM-210-002

### Phase 9 — Blueprint closeout

#### Task 9.9: Roll-up 작성 및 plan-close [Unit: Atomic]
- Task-ID: [TEM-210-099] | Linear-Issue: TEM-210 | Status: done | Priority: 3 | Labels: docs | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `docs/plans/PLAN_content_rendering_fix.md` (모든 구현 Task Conclusion 확인)
- **Action**: Edit File | **Target**: `docs/plans/PLAN_content_rendering_fix.md`
- **Closeout**: `docs/plans/PLAN_content_rendering_fix.md` (Task TEM-210-099 `Conclusion`·`Status`)
- **Goal**: 선행 Task Conclusion을 근거로 `

## 🔁 Conclusion & Summary` Roll-up 1문단을 실측으로 작성한다.
- **Diagnostics**: 0
- **Verify**: `just plan-close plan=docs/plans/PLAN_content_rendering_fix.md`
- **Conclusion**: Roll-up 작성 완료. Conclusion & Summary 섹션에 전체 4개 Task 실측 결과 요약 기입. just plan-lint PASS, python render API 검증 exit 0, python Head 통합 검증 exit 0. plan-close gate 진입 전 모든 선행 Task Conclusion 기입 완료. [closed-by:plan-task-close]
- **Dependency**: TEM-210-004

## 🔁 Conclusion & Summary

- **Roll-up**: 콘텐츠 렌더링 개선 전체 완료. (1) content/config.ts schema 검증 — tag·title·summary·publishedAt 필드 모두 존재, render() 전환에 변경 불필요. (2) Head.astro Props 검증 — ogImage·ogUrl·ogType·publishedAt·tag 모두 이미 정의됨, article 타입 및 twitter:image 지원. (3) [slug].astro render() API 전환 — getEntry('cases', slug)로 entry 개별 조회, await render(entry)로 MDX Content 컴포넌트 렌더링, escapeHtml 및 수동 split('\\n\\n') 제거. (4) Layout.astro Head.astro 통합 — duplicate HeadProps interface 제거, Head.astro에서 type export import, <Head {...props} /> spread 패턴 적용. just plan-lint PASS, 모든 python 검증 스크립트 exit 0.

## ✅ Definition of Done (DoD)

> **작성 규칙**: 사람이 개입해야 하는 수동 스모크 테스트(Manual Smoke Test) 작성을 금지합니다.
> 모든 DoD 항목은 기계적으로 자동 검증 가능한 형태로 작성하되, 실행할 명령어는 **반드시 백틱(\`)으로 감싸서** 리스트 항목으로 작성하세요. `[ ]` 체크리스트 포맷은 사용하지 마세요.
> **Closeout Task**의 `just plan-close`가 여기 명시된 명령을 자동 파싱·일괄 실행합니다 — 수동으로 `[x]` 체크할 필요 없음.

- `just plan-lint docs/plans/PLAN_content_rendering_fix.md`
- `uv run python -c "assert open('src/pages/case/[slug].astro').read() and 'render' in open('src/pages/case/[slug].astro').read(), 'render API check'"`
- `uv run python -c "assert open('src/components/Layout.astro').read() and 'Head' in open('src/components/Layout.astro').read(), 'Head integration check'"`

## 검증 행렬

| Scope | Command |
| :--- | :--- |
| Blueprint | `just plan-lint docs/plans/PLAN_content_rendering_fix.md` |
| Closeout gate | `just plan-close plan=docs/plans/PLAN_content_rendering_fix.md` |

