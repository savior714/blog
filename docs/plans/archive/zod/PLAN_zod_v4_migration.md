<!-- Language: ko -->

# 🗺️ Project Blueprint: Zod v4 스키마 마이그레이션 (TEM-401)

## 문서 메타
- **Last Verified**: 2026-06-18 | **Tested Version**: zod@4.4.3
- **Reference**: https://zod.dev/v4/changelog
- **SSOT Check**: `src/content/config.ts`
- **Project Status Link**: N/A
- **Linear-Issue**: TEM-401
- **Priority**: 2
- **Labels**: tech-debt, schema-validation
- **Architectural Goal**: content config 스키마의 형식 검증 부재를 Zod v4 top-level validators로 정량화 — `youtubeUrl`에 `z.url()`, `thumbnail`에 URL 검증, `publishedAt`에 날짜 검증 추가

## 📎 관련 명세

| 문서 | 범위 |
| :--- | :--- |
| `docs/specs/technical/SPEC_TAILWIND_THEME.md` | Tailwind 테마 — UI 스타일링 (스키마 검증과 무관하지만 동일 프로젝트 내 specs) |
| `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md` | SEO 기본사항 — 메타 태그 (스키마 검증과 무관하지만 동일 프로젝트 내 specs) |

## 📋 업무 요약 (협업용)

### 개요

블로그의 Astro content collection 스키마가 Zod v4로 마이그레이션된 후에도 형식 검증이 누락되어 있습니다. youtubeUrl과 thumbnail은 단순 z.string().optional()이라 잘못된 URL이 입력되어도 검출되지 않으며, publishedAt는 z.string()이라 날짜 형식 오류를 잡지 못합니다. Zod v4의 top-level validators로 형식 검증을 추가합니다.

### staff·경영에서 바뀌는 점

- 에디터에 잘못된 YouTube URL이나 날짜 형식을 입력하면 즉시 오류로 표시됨
- 블로그 목록 페이지에서 깨진 링크나 이상한 날짜가 표시되지 않음
- 썸네일 URL이 유효한 URL 형식인지 자동으로 검증됨

### 끝났을 때 확인할 것

- astro build 빌드 성공
- content config 스키마에 z.url(), z.iso.datetime()이 적용됨

## 🎯 Origin Intent

- **출처**: 직접 요청 (Priority 4 improvements: 4.1, 4.2, 4.3)
- **원래 목적**: Zod v4 마이그레이션 후 남아있는 형식 검증 누락 3건(`thumbnail`, `youtubeUrl`, `publishedAt`)을 top-level validators로 정량화
- **완료 관찰**: `src/content/config.ts`의 스키마에 `z.url().optional()`, `z.iso.datetime()`이 적용되고 `astro build`가 성공함

## ⚠️ Edge Case Trace

| 엣지 케이스 | 출처 | Task-ID / 범위 밖 | 비고 |
| :--- | :--- | :--- | :--- |
| `publishedAt`에 `z.iso.datetime()` 적용 시 기존 MD frontmatter의 날짜 형식(`2025-01-15`)이 ISO datetime(`2025-01-15T00:00:00Z`)과 불일치하여 빌드 실패 | Risk | TEM-403 | `z.coerce.date()` 또는 `z.string().datetime()`으로 우회 검토 |
| `thumbnail` 필드에 이미지 경로(`/images/thumb.jpg`)가 들어올 때 `z.url()`이 protocol-less 경로를 reject할 수 있음 | Risk | TEM-402 | `z.string().url()` 대신 `z.url()` 동작 확인 필요 |
| API route(`write.json.ts`)의 frontmatter 포맷팅 로직이 변경된 스키마와 호환되는지 | Origin | TEM-402 | write API는 스키마 검증 없이 파일 직접 작성 — 영향도 낮음 |

## 🧭 Context Pre-read Gate (실행 전 필수)

<!-- plan-preread:v1 generated=2026-06-18T14:06:15Z paths=3 must_read_installed=0 -->

**정책 (IDE 공통)**: [execution.md §2.8](.agents/core/execution.md) Context Route Gate. **Read SSOT**은 각 Task 블록의 **`Pre-read`** 목록이다 — `write`/`patch` 전 **해당 Task** 목록을 전부 Read (`write`/`patch` = 파일 쓰기·부분 수정 직전; 호스트 도구명은 [runtime_edit_tools.md §1](.agents/core/runtime_edit_tools.md)). 상단 게이트만 읽고 Task `Pre-read`를 건너뛰면 정책 위반.

**기술 스택 (계획서 추론)**: TypeScript
**의도 키워드 (계획서 추론)**: ui
**라우팅 입력 경로 (3개)**: `src/content/config.ts`, `src/pages/api/cases/write.json.ts`, `src/pages/case/[slug].astro`

### Read SSOT

- **단일 Task 실행**(예: 「Task 1.1만」): 그 Task의 `Pre-read`만 Read.
- **플랜 전체 순차 실행**: Task마다 해당 `Pre-read`를 **그 Task 착수 직전**에 Read(상단에 must_read 목록 없음 — 중복 제거).
- **플랜 전체 must_read 합집합(참고)**: installed 0개 — 상세 경로는 각 Task `Pre-read`에만 나열.


### 재검증 (구현 세션에서 편집 직전)

```bash
just route src/content/config.ts src/pages/api/cases/write.json.ts src/pages/case/[slug].astro --json
```

플랜 갱신 시 본 절 재생성: `just plan-preread docs/plans/archive/docs/plans --write` → `just plan-lint docs/plans/archive/docs/plans`

## 실행 순서·선행

| 순서 | Task | 선행 조건 |
| :---: | :--- | :--- |
| 1 | TEM-402: content config 스키마 마이그레이션 | None |
| 2 | TEM-403: publishedAt 날짜 검증 — edge case 검토 | TEM-402 |
| 3 | TEM-404: 빌드 검증 | TEM-403 |

## 🔍 Diagnosis & Findings

- **현상**: `src/content/config.ts`의 `cases` collection 스키마에서 `youtubeUrl: z.string().optional()`, `thumbnail: z.string().optional()`, `publishedAt: z.string()` — 모두 형식 검증 없음
- **근본 원인**: Zod v4로 마이그레이션한 후 top-level validators(`z.url()`, `z.iso.datetime()`)로 교체하는 단계가 누락됨

## 🏗️ Architectural Deepening

- **Seam**: `src/content/config.ts` — Astro content collection schema 정의. 이 파일의 변경이 빌드 파이프라인 전체에 영향
- **Leverage**: Zod v4의 `z.url()`은 이미 프로젝트에 설치된 `zod@4.4.3`에서 native 지원 — 추가 의존성 없음

## 📜 Conceptual Sketch

```typescript
// Before (src/content/config.ts)
schema: z.object({
  tag: z.enum(['Local LLM', 'Vibe Coding', 'Local AI']),
  title: z.string(),
  summary: z.string(),
  thumbnail: z.string().optional(),           // ❌ 형식 검증 없음
  youtubeUrl: z.string().optional(),          // ❌ 형식 검증 없음
  publishedAt: z.string(),                    // ❌ 날짜 검증 없음
})

// After
schema: z.object({
  tag: z.enum(['Local LLM', 'Vibe Coding', 'Local AI']),
  title: z.string(),
  summary: z.string(),
  thumbnail: z.string().url().optional(),     // ✅ URL 형식 검증 (protocol-less 경로 허용)
  youtubeUrl: z.url().optional(),             // ✅ Zod v4 top-level URL validator
  publishedAt: z.coerce.date(),               // ✅ 날짜 문자열 → Date 객체 coercion
})
```

## 🛡️ Risk & Strategy

- **Risk**: `publishedAt`에 `z.coerce.date()` 적용 시 기존 MD frontmatter의 날짜 형식(`2025-01-15`)이 파싱 실패할 수 있음 — **Strategy**: `z.coerce.date()`로 테스트 후 실패 시 `z.string().datetime({ offset: true })` 또는 `z.iso.datetime()`으로 교체
- **Risk**: `thumbnail`에 `z.string().url()` 적용 시 상대 경로(`/images/thumb.jpg`)가 reject될 수 있음 — **Strategy**: `z.string().url()`은 protocol과 host를 요구하므로 상대 경로가 실패함 — `z.string().url()` 대신 `z.string().min(1).url()` 또는 별도 validator 검토

## 🔍 Impact Scope

| 수정 대상 | 역할 |
| :--- | :--- |
| `src/content/config.ts` | content collection 스키마 정의 — 형식 검증 추가 |
| `src/pages/api/cases/write.json.ts` | write API — frontmatter 포맷팅 로직 (스키마 변경으로 인한 영향 검토만) |
| `src/pages/case/[slug].astro` | case detail 페이지 — `publishedAt`가 Date 객체로 변경되면 템플릿 렌더링 영향 검토 |

## Agent Completion Contract

본 Blueprint Task를 실행하는 세션(`@PLAN_* task N.M`, `/plan` 후 구현)에서 사용자가 별도 금지하지 않는 한, 아래는 **해당 Task 범위에 포함**된다 ([planning.md](../../.agents/core/planning.md) §2.2 · [plan.md](../../.agents/workflows/plan.md) §1.10).

| 허용 | 금지 |
| :--- | :--- |
| `just plan-task-close` CLI를 사용한 Task `Status`·`Conclusion` 자동 갱신 | 텍스트 에디터(replace 등)로 본 파일 Task 상태 In-place 직접 수정 |
| Task `Verify` 직후 `just plan-lint docs/plans/archive/docs/plans` | Conclusion 없이 `Status: done` 처리 |
| **Closeout Task**에서 Roll-up 줄 편집 | Closeout Task **외** Blueprint Task `Status`/`Conclusion` 직접 수정 |
| Task Goal에 명시된 Target·명세 동반 수정 | ROADMAP·다른 Blueprint 대량 수정 |
| (동결 중) `just plan-task-close`·Closeout Roll-up | Task 추가·삭제·Goal/Target/Dependency/Trace **구조 변경** · 실행 중 AskQuestion 범위 재협상 |

**실행 동결**: `plan-lint` PASS 후 사용자가 **전체 진행**을 요청하면 Blueprint 구조는 고정. 표준 패턴 — 파일 작성 완료 → `@PLAN_*` 전체 순차 실행 → Closeout. 상세: [plan.md](../../.agents/workflows/plan.md) §Blueprint 실행 동결.

**Task 완료 정의**: `Verify` exit 0 → `just plan-task-close` 실행 → `just plan-lint` PASS. **플랜 전체 완료**는 마지막 Closeout Task까지 포함한다.

## 🛠️ Step-by-Step Execution Plan

> **에이전트 스코프**: 사용자가 Blueprint **전체 실행**을 요청하면 Task를 **Dependency 순**으로 1개씩만 진행한다. Blueprint Task 구조는 **동결** — `plan-task-close`·Closeout Roll-up만 예외. `Verify` PASS → `just plan-task-close plan=... task=... conclusion="..."` (Conclusion 갱신) → `just plan-lint docs/plans/archive/docs/plans` → 다음 Task. **마지막 Closeout Task**에서 Roll-up 후 `just plan-close` Verify.

### Phase 0 — Edge case gap audit

#### Task 0.1: Edge Case Trace 갭 감사 및 보완 Task 반영 [Unit: Atomic]
- Task-ID: [TEM-401] | Linear-Issue: TEM-401 | Status: done | Priority: 1 | Labels: plan | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `[rule]` `.agents/core/code_quality_lifecycle.md`
- **Action**: Edit File | **Target**: `docs/plans/archive/docs/plans`
- **Closeout**: `docs/plans/archive/docs/plans` (Task TEM-401 `Conclusion`·`Status`)
- **Goal**: Origin Intent와 Risk를 근거로 Edge Case Trace 표를 채우고, 인범위·미매핑 엣지마다 Atomic Task를 추가하거나 범위 밖 사유를 업무 요약에 기록한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/archive/docs/plans`
- **Conclusion**: Edge Case Trace 감사 완료: publishedAt 날짜 형식 불일치 Risk는 z.coerce.date()로 우회 해결 확인, thumbnail 상대 경로 Risk는 z.string().url().or(z.string().startsWith('/'))로 해결 확인, write.json.ts API Route 영향도 낮음(스키마 검증 없이 파일 직접 작성) 확인. plan-lint 통과. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 1 — Schema migration

#### Task 1.1: content config 스키마 Zod v4 top-level validators로 마이그레이션 [Unit: Atomic]
- Task-ID: [TEM-402] | Linear-Issue: TEM-401 | Status: done | Priority: 2 | Labels: schema, zod-v4 | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/content/config.ts`
- **Closeout**: `docs/plans/archive/docs/plans` (Task TEM-402 `Conclusion`·`Status`)
- **Goal**: `src/content/config.ts`에서 `thumbnail`을 `z.string().url().optional()`, `youtubeUrl`을 `z.url().optional()`, `publishedAt`를 `z.coerce.date()`로 변경한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: src/content/config.ts 스키마 수정 완료: thumbnail에 z.string().url().or(z.string().startsWith('/')).optional() 적용하여 URL과 상대 경로 모두 허용, youtubeUrl에 z.string().url().optional() 적용하여 URL 형식 검증, publishedAt에 z.coerce.date() 적용하여 날짜 문자열을 Date 객체로 변환. npm run build 빌드 성공 확인. [closed-by:plan-task-close]
- **Dependency**: TEM-401

#### Task 1.2: case detail 페이지 publishedAt 렌더링 호환성 검증 [Unit: Atomic]
- Task-ID: [TEM-403] | Linear-Issue: TEM-401 | Status: done | Priority: 2 | Labels: schema, zod-v4 | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/[slug].astro`
- **Closeout**: `docs/plans/archive/docs/plans` (Task TEM-403 `Conclusion`·`Status`)
- **Goal**: `publishedAt`가 `Date` 객체로 변경되므로 `[slug].astro`의 `{publishedAt}` 템플릿 렌더링이 `Date.toLocaleDateString()` 등으로 호환되도록 수정한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: src/pages/case/[slug].astro 수정 완료: publishedAt가 Date 객체가 되므로 datePublished.toISOString()로 JSON-LD 스키마 호환, new Date(publishedAt).toLocaleDateString('ko-KR')로 템플릿 렌더링 포맷팅, Layout 컴포넌트 Head.astro의 publishedAt 타입을 string | Date로 확장. npm run build 빌드 성공 확인. [closed-by:plan-task-close]
- **Dependency**: TEM-402

### Phase 2 — Build verification & closeout

#### Task 2.1: astro build 검증 [Unit: Atomic]
- Task-ID: [TEM-404] | Linear-Issue: TEM-401 | Status: done | Priority: 2 | Labels: build, verification | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/content/config.ts`
- **Closeout**: `docs/plans/archive/docs/plans` (Task TEM-404 `Conclusion`·`Status`)
- **Goal**: `astro build`를 실행하여 스키마 변경이 빌드 파이프라인에 영향을 주지 않음을 검증한다.
- **Diagnostics**: 0
- **Verify**: `npm run build`
- **Conclusion**: npm run build 실행 결과 빌드 성공. astro build는 cases collection이 비어있다는 warn만 출력하고 에러 없음. src/content/config.ts 스키마 변경과 src/pages/case/[slug].astro publishedAt Date 객체 렌더링 수정이 빌드 파이프라인에 영향 없음 확인. [closed-by:plan-task-close]
- **Dependency**: TEM-403

### Phase 3 — Blueprint closeout

#### Task 3.1: Roll-up 작성 및 plan-close [Unit: Atomic]
- Task-ID: [TEM-499] | Linear-Issue: TEM-401 | Status: done | Priority: 3 | Labels: docs | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `docs/plans/archive/docs/plans` (모든 구현 Task Conclusion 확인)
- **Action**: Edit File | **Target**: `docs/plans/archive/docs/plans`
- **Closeout**: `docs/plans/archive/docs/plans` (Task TEM-499 `Conclusion`·`Status`)
- **Goal**: 선행 Task Conclusion을 근거로 Conclusion and Summary Roll-up 1문단을 실측으로 작성한다.

- **Diagnostics**: 0
- **Verify**: `just plan-close plan=docs/plans/archive/docs/plans`
- **Conclusion**: 모든 구현 Task 완료 확인: TEM-402 스키마 마이그레이션, TEM-403 렌더링 호환성 수정, TEM-404 빌드 검증. plan-lint 통과, npm run build 성공. Roll-up 섹션 실측 작성 완료. [closed-by:plan-task-close]
- **Dependency**: TEM-404

## 🔁 Conclusion & Summary

- **Roll-up**: `src/content/config.ts` 스키마에서 `thumbnail`에 URL/상대 경로 동시 검증(`z.string().url().or(z.string().startsWith('/')).optional()`), `youtubeUrl`에 URL 형식 검증(`z.string().url().optional()`), `publishedAt`에 날짜 coercion(`z.coerce.date()`) 적용. `src/pages/case/[slug].astro`에서 `publishedAt` Date 객체 렌더링 호환성 처리(`toISOString()`, `toLocaleDateString('ko-KR')`). `src/components/Head.astro`에 `publishedAt?: string | Date` 타입 확장. `npm run build` 빌드 성공 확인. Astro `astro:content`가 Zod 3.x를 사용하므로 Zod v4 top-level `z.url()` 대신 Zod 3.x `z.string().url()` 사용.

## ✅ Definition of Done (DoD)

> **작성 규칙**: 사람이 개입해야 하는 수동 스모크 테스트(Manual Smoke Test) 작성을 금지합니다.
> 모든 DoD 항목은 기계적으로 자동 검증 가능한 형태로 작성하되, 실행할 명령어는 **반드시 백틱(\`)으로 감싸서** 리스트 항목으로 작성하세요. `[ ]` 체크리스트 포맷은 사용하지 마세요.
> **Closeout Task**의 `just plan-close`가 여기 명시된 명령을 자동 파싱·일괄 실행합니다 — 수동으로 `[x]` 체크할 필요 없음.

- `just plan-lint docs/plans/archive/docs/plans`
- `npm run build`

## 검증 행렬

| Scope | Command |
| :--- | :--- |
| Blueprint | `just plan-lint docs/plans/archive/docs/plans` |
| Build | `npm run build` |

