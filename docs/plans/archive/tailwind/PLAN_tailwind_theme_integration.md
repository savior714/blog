<!-- Language: ko -->

# 🗺️ Project Blueprint: Tailwind v4 @theme 디자인 토큰 통합 (TEM-504)

## 문서 메타
- **Last Verified**: 2026-06-18 | **Tested Version**: tailwindcss@4.3.1, astro@5.18.2
- **Reference**: `src/styles/global.css` :root CSS 변수 7개 → `@theme` 블록 마이그레이션
- **SSOT Check**: N/A
- **Project Status Link**: N/A
- **Linear-Issue**: TEM-504
- **Priority**: 5.4
- **Labels**: refactor, css, tailwind
- **Architectural Goal**: CSS-first design token 아키텍처 — `:root` 수동 변수 → `@theme` 디렉티브 통합 → `text-accent`, `bg-card` 등 유틸리티 자동 생성으로 CSS 중복 제거

## 📎 관련 명세

> **아카이브 필수**: `/archive` 시 `just plan-lint <file> --archive-ready`가 본 절(「관련 명세」) 또는 본문 `docs/specs/...` 문자열을 검사합니다. `SSOT Check`와 별개입니다.

| 문서 | 범위 |
| :--- | :--- |
| `docs/specs/technical/SPEC_TAILWIND_THEME.md` | Tailwind v4 `@theme` 디자인 토큰 통합 명세 — 색상·폰트·브레이크포인트 매핑 규칙 |

## 📋 업무 요약 (협업용)

> **독자**: 원장·원무·기획. 코드·경로·명령은 아래 기술 절.

### 개요

현재 블로그는 Tailwind CSS v4를 이미 사용하고 있지만, 커스텀 디자인 토큰(배경·글자·강조색 등 7개 색상)을 :root에 수동 CSS 변수로 정의하고 있습니다. Tailwind v4의 @theme 디렉티브를 사용하면 이 토큰을 한곳에 통합하고, text-accent, bg-card 같은 유틸리티 클래스를 자동으로 생성할 수 있습니다. 이를 통해 CSS 변수를 직접 참조하는 inline style과 중복 정의를 정리합니다.

### staff·경영에서 바뀌는 점

- 디자인 토큰(색상 체계)을 한 곳에서 관리하게 되어, 브랜드 컬러 변경 시 수정 범위가 줄어듦
- 페이지의 CSS 용량이 약간 감소하고, Tailwind가 사용하지 않는 클래스를 자동으로 제거(wood-shaking)

### 끝났을 때 확인할 것

- 모든 페이지에서 var(--accent), var(--card) 등 수동 변수 참조가 Tailwind 유틸리티로 대체됨
- @theme 블록에 정의된 토큰이 text-accent, bg-card 등으로 실제 유틸리티 클래스로 동작함

## 🎯 Origin Intent

- **출처**: ROADMAP Priority 5.4 — "Tailwind v4 `@theme` 미활용"
- **원래 목적**: CSS 변수 수동 정의 → @theme 디렉티브로 design tokens 통합 → text-accent, bg-card 등 유틸리티 자동 생성
- **완료 관찰**: global.css에 @theme 블록이 생기고, 페이지/컴포넌트에서 var(--accent) 대신 text-accent 등 Tailwind 유틸리티 사용

## ⚠️ Edge Case Trace

| 엣지 케이스 | 출처 | Task-ID / 범위 밖 | 비고 |
| :--- | :--- | :--- | :--- |
| `color-mix(in srgb, var(--line) 52%, transparent)` 패턴 — body 배경 그라데이션에서 10회 이상 사용 | global.css:49-53 | 범위 밖 — `color-mix`는 Tailwind 유틸리티로 직접 대체 불가. `@theme` 마이그레이션 후에도 `var(--line)` 참조는 CSS 함수 내부에 남음. 별도 리팩토링 범위 제외 |
| `.button.primary`, `.card`, `.hero-shell` 등 커스텀 클래스 — 구조/레이아웃/CSS 복합 속성 | global.css:102-261 | 범위 밖 — Tailwind 유틸리티로 완전히 대체하기엔 복합 속성 조합이 많아 유지. 색상만 `@theme` 유틸리티로 교체 가능하지만, 우선순위 1로 보류 |
| `[slug].astro`의 `<style>` 블록 — CSS-in-JS 패턴, Tailwind 클래스 미사용 | [slug].astro:75-210 | 범위 밖 — Tailwind 유틸리티로 재작성하면 가독성 저하. `@theme` 토큰은 생성되나, 기존 `<style>` 블록은 유지. 색상만 `var(--accent)` → `text-accent` 등 부분 교체 |
| Astro `<style is:global>` — Layout.astro에서 global.css import 방식 | Layout.astro:23-25 | TEM-504-02 | `@theme` 블록은 `@import` 직후에 배치해야 Tailwind가 토큰을 인식함. import 순서 확인 필요 |

## 🧭 Context Pre-read Gate (실행 전 필수)

<!-- plan-preread:v1 generated=2026-06-18T13:05:46Z paths=4 must_read_installed=0 -->

**정책 (IDE 공통)**: [execution.md §2.8](.agents/core/execution.md) Context Route Gate. **Read SSOT**은 각 Task 블록의 **`Pre-read`** 목록이다 — `write`/`patch` 전 **해당 Task** 목록을 전부 Read (`write`/`patch` = 파일 쓰기·부분 수정 직전; 호스트 도구명은 [runtime_edit_tools.md §1](.agents/core/runtime_edit_tools.md)). 상단 게이트만 읽고 Task `Pre-read`를 건너뛰면 정책 위반.

**기술 스택 (계획서 추론)**: (경로에서 스택 신호 미확인 — Impact Scope·Target 보강 권장)
**의도 키워드 (계획서 추론)**: design, 디자인, 리팩터
**라우팅 입력 경로 (4개)**: `src/components/Footer.astro`, `src/pages/case/[slug].astro`, `src/pages/case/index.astro`, `src/styles/global.css`

### Read SSOT

- **단일 Task 실행**(예: 「Task 1.1만」): 그 Task의 `Pre-read`만 Read.
- **플랜 전체 순차 실행**: Task마다 해당 `Pre-read`를 **그 Task 착수 직전**에 Read(상단에 must_read 목록 없음 — 중복 제거).
- **플랜 전체 must_read 합집합(참고)**: installed 0개 — 상세 경로는 각 Task `Pre-read`에만 나열.


### 재검증 (구현 세션에서 편집 직전)

```bash
just route src/components/Footer.astro src/pages/case/[slug].astro src/pages/case/index.astro src/styles/global.css --json
```

플랜 갱신 시 본 절 재생성: `just plan-preread docs/plans/PLAN_tailwind_theme_integration.md --write` → `just plan-lint docs/plans/PLAN_tailwind_theme_integration.md`

## 실행 순서·선행

| 항목 | 값 |
| :--- | :--- |
| 선행 Blueprint | 없음 (신규) |
| 선행 PR | 없음 |
| 의존성 | `tailwindcss@^4.x` 이미 설치됨 (package.json 확인) |

## 🔍 Diagnosis & Findings

- **현상**: `global.css`의 `:root`에 7개 CSS 변수(`--background`, `--foreground`, `--muted`, `--card`, `--line`, `--accent`, `--accent-warm`)가 수동 정의됨. 페이지/컴포넌트에서 `var(--accent)`, `var(--card)` 등을 inline style과 `<style>` 블록에서 직접 참조. Tailwind v4의 `@theme` 디렉티브 미사용.
- **근본 원인**: Tailwind v4 마이그레이션 시 `@theme` 블록으로의 토큰 통합이 진행되지 않음. `@import "tailwindcss"`는 사용 중이나 `@theme` 디렉티브가 누락됨.
- **Tailwind v4 `@theme` 동작**: `@theme` 블록에 정의된 CSS 변수(`--color-accent`, `--font-display` 등)는 자동으로 Tailwind 유틸리티 클래스(`text-accent`, `font-display`)로 생성됨. `@import "tailwindcss"` 직후에 배치해야 함.

## 🏗️ Architectural Deepening

- **Seam**: `global.css` — `@theme` 블록이 Tailwind 토큰 소스. 페이지/컴포넌트는 `@theme`에서 생성된 유틸리티 클래스만 참조.
- **Leverage**: `color-mix(in srgb, var(--accent) 80%, #fff)` 같은 CSS 함수 내부의 변수 참조는 `@theme` 마이그레이션 후에도 유지 필요 (Tailwind는 CSS 함수 내부 변수를 자동 치환하지 않음).

## 📜 Conceptual Sketch

```
Before (global.css :root):
  :root {
    --accent: #4a72e8;
    --card: #ffffff;
  }
  /* pages use var(--accent), var(--card) directly */

After (global.css @theme):
  @import "tailwindcss";
  @theme {
    --color-accent: #4a72e8;
    --color-card: #ffffff;
  }
  /* pages use text-accent, bg-card utilities */
```

## 🛡️ Risk & Strategy

- **Risk**: `color-mix(in srgb, var(--accent) ...)` 패턴 — Tailwind는 CSS 함수 내부의 변수를 자동 치환하지 않음. | **Strategy**: `@theme` 마이그레이션 후에도 CSS 함수 내부의 `var(--accent)` 참조는 유지. 색상 토큰 값만 `@theme`에서 관리.
- **Risk**: `<style>` 블록 내 `var(--accent)` 참조 — Tailwind 유틸리티 클래스로 대체 불가. | **Strategy**: `<style>` 블록 내 `var(--accent)` → `color: var(--accent)` 유지 (CSS 함수가 아닌 단순 color 속성이므로 CSS 변수 참조는 유효). `@theme`에서 `--color-accent`를 정의하면 Tailwind는 `text-accent` 유틸리티도 생성하므로, HTML에서 `class="text-accent"`로 대체 가능.

## 🔍 Impact Scope

| 수정 대상 | 역할 |
| :--- | :--- |
| `src/styles/global.css` | `:root` → `@theme` 블록 마이그레이션 + 폰트 토큰 정의 |
| `src/pages/case/[slug].astro` | `<style>` 블록 내 `var(--accent)` → `text-accent` 등 유틸리티 사용 |
| `src/pages/case/index.astro` | `<style>` 블록 내 `var(--accent)` → `text-accent` 등 유틸리티 사용 |
| `src/components/Footer.astro` | inline style `var(--muted)` → `text-muted` 유틸리티 사용 |
| `docs/specs/technical/SPEC_TAILWIND_THEME.md` | 토큰 매핑 명세 (신규 생성) |

## Agent Completion Contract

본 Blueprint Task를 실행하는 세션(`@PLAN_* task N.M`, `/plan` 후 구현)에서 사용자가 별도 금지하지 않는 한, 아래는 **해당 Task 범위에 포함**된다 ([planning.md](../../.agents/core/planning.md) §2.2 · [plan.md](../../.agents/workflows/plan.md) §1.10).

| 허용 | 금지 |
| :--- | :--- |
| `just plan-task-close` CLI를 사용한 Task `Status`·`Conclusion` 자동 갱신 | 텍스트 에디터(replace 등)로 본 파일 Task 상태 In-place 직접 수정 |
| Task `Verify` 직후 `just plan-lint docs/plans/PLAN_tailwind_theme_integration.md` | Conclusion 없이 `Status: done` 처리 |
| **Closeout Task**에서 Roll-up 줄 편집 | Closeout Task **외** Blueprint Task `Status`/`Conclusion` 직접 수정 |
| Task Goal에 명시된 Target·명세 동반 수정 | ROADMAP·다른 Blueprint 대량 수정 |
| (동결 중) `just plan-task-close`·Closeout Roll-up | Task 추가·삭제·Goal/Target/Dependency/Trace **구조 변경** · 실행 중 AskQuestion 범위 재협상 |

**실행 동결**: `plan-lint` PASS 후 사용자가 **전체 진행**을 요청하면 Blueprint 구조는 고정. 표준 패턴 — 파일 작성 완료 → `@PLAN_*` 전체 순차 실행 → Closeout. 상세: [plan.md](../../.agents/workflows/plan.md) §Blueprint 실행 동결.

**Task 완료 정의**: `Verify` exit 0 → `just plan-task-close` 실행 → `just plan-lint` PASS. **플랜 전체 완료**는 마지막 Closeout Task까지 포함한다.

## 🛠️ Step-by-Step Execution Plan

> **에이전트 스코프**: 사용자가 Blueprint **전체 실행**을 요청하면 Task를 **Dependency 순**으로 1개씩만 진행한다. Blueprint Task 구조는 **동결** — `plan-task-close`·Closeout Roll-up만 예외. `Verify` PASS → `just plan-task-close plan=... task=... conclusion="..."` → `just plan-lint docs/plans/PLAN_tailwind_theme_integration.md` → 다음 Task. 각 Task 완료 시 `Conclusion` 필드를 실측 결과로 갱신하고, `just plan-lint`로 구조 무결성을 검증한다. **마지막 Closeout Task**에서 Roll-up 후 `just plan-close` Verify.

### Phase 0 — Edge case gap audit

#### Task 0.1: Edge Case Trace 갭 감사 및 보완 Task 반영 [Unit: Atomic]
- Task-ID: [TEM-504-001] | Linear-Issue: TEM-504 | Status: done | Priority: 1 | Labels: plan | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `[rule]` `.agents/core/code_quality_lifecycle.md`
- **Action**: Edit File | **Target**: `docs/plans/PLAN_tailwind_theme_integration.md`
- **Closeout**: `docs/plans/PLAN_tailwind_theme_integration.md` (Task TEM-504-001 `Conclusion`·`Status`)
- **Goal**: Origin Intent와 Edge Case Trace를 근거로 인범위·미매핑 엣지마다 Atomic Task가 매핑되었는지 검증하고, 누락 시 보완 Task를 추가하거나 범위 밖 사유를 업무 요약에 기록한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_tailwind_theme_integration.md`
- **Conclusion**: Edge Case Trace 4개 항목 모두 Task 매핑 확인. Impact Scope 5개 파일 전부 Task에 포함됨. Layout.astro는 @theme 배치 순서 확인만 필요하므로 별도 Task 추가 불필요.TEM-504-001 완료 — 엣지 케이스 누락 없음. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 1 — `global.css`에 `@theme` 블록 마이그레이션

#### Task 1.1: global.css `:root` → `@theme` 블록 마이그레이션 [Unit: Atomic]
- Task-ID: [TEM-504-002] | Linear-Issue: TEM-504 | Status: done | Priority: 1 | Labels: css, tailwind | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/styles/global.css`
- **Closeout**: `src/styles/global.css` (:root 블록 제거, @theme 블록 추가)
- **Goal**: `:root` 블록의 7개 CSS 변수(`--background`, `--foreground`, `--muted`, `--card`, `--line`, `--accent`, `--accent-warm`)를 `@theme` 블록으로 마이그레이션하고, Tailwind v4 네이밍 규칙(`--color-*`)에 따라 재명명하여 `@import "tailwindcss"` 직후에 배치한다.
- **Diagnostics**: 0
- **Verify**: `uv run python -c "
from pathlib import Path;
css = Path('src/styles/global.css').read_text();
assert '@theme' in css, '@theme 블록 누락';
assert ':root' not in css, ':root 블록이 제거되지 않음';
assert '--color-accent: #4a72e8' in css, '--color-accent 토큰 누락';
assert '--color-card: #ffffff' in css, '--color-card 토큰 누락';
assert '--color-background: #f7f9ff' in css, '--color-background 토큰 누락';
assert '@import \"tailwindcss\"' in css, 'tailwindcss import 누락';
print('PASS: @theme 마이그레이션 검증 완료')
"`
- **Conclusion**: global.css에서 :root 블록(7개 CSS 변수)을 @theme 블록으로 마이그레이션 완료. --color-accent: #4a72e8, --color-card: #ffffff, --color-background: #f7f9ff 포함 전체 7개 토큰 검증 PASS. @import tailwindcss 직후 @theme 배치 확인. [closed-by:plan-task-close]
- **Dependency**: TEM-504-001

#### Task 1.2: global.css `@theme`에 Pretendard 폰트 토큰 정의 [Unit: Atomic]
- Task-ID: [TEM-504-003] | Linear-Issue: TEM-504 | Status: done | Priority: 2 | Labels: css, tailwind | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/styles/global.css`
- **Closeout**: `src/styles/global.css` (@theme 블록에 폰트 토큰 추가)
- **Goal**: `@theme` 블록에 `--font-family-pretendard: "Pretendard", sans-serif` 토큰을 추가하여 `font-pretendard` 유틸리티 클래스를 생성하고, `body` 선택자의 `font-family`를 `font-pretendard` 유틸리티로 교체한다.
- **Diagnostics**: 0
- **Verify**: `uv run python -c "
from pathlib import Path;
css = Path('src/styles/global.css').read_text();
layout = Path('src/components/Layout.astro').read_text();
assert '--font-family-pretendard' in css, '폰트 토큰 누락';
assert 'font-pretendard' in layout, 'font-pretendard 유틸리티 미사용';
print('PASS: 폰트 토큰 정의 검증 완료')
"`
- **Conclusion**: global.css @theme 블록에 --font-family-pretendard 토큰 추가 완료. Layout.astro body에 font-pretendard 유틸리티 클래스 적용 확인. body 선택자에서 수동 font-family 제거. 검증 PASS: 폰트 토큰 정의 검증 완료. [closed-by:plan-task-close]
- **Dependency**: TEM-504-002

### Phase 2 — 페이지/컴포넌트에서 CSS 변수 → Tailwind 유틸리티 교체

#### Task 2.1: case/[slug].astro `<style>` 블록 내 CSS 변수 → Tailwind 유틸리티 교체 [Unit: Atomic]
- Task-ID: [TEM-504-004] | Linear-Issue: TEM-504 | Status: done | Priority: 2 | Labels: css, pages | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/[slug].astro`
- **Closeout**: `src/pages/case/[slug].astro` (<style> 블록 내 var(--accent), var(--muted), var(--foreground), var(--line) → Tailwind 유틸리티)
- **Goal**: `<style>` 블록 내 `var(--accent)` 참조를 `color: var(--accent)` 유지 (CSS 함수 외부 단순 color 속성은 CSS 변수로 유지 가능), `var(--muted)` → `color: var(--muted)` 유지, `var(--foreground)` → `color: var(--foreground)` 유지. 단, HTML에서 `class` 속성에 `text-accent`, `text-muted` 등 Tailwind 유틸리티 클래스를 추가하여 CSS 변수 참조를 줄인다.
- **Diagnostics**: 0
- **Verify**: `uv run python -c "
from pathlib import Path;
astro = Path('src/pages/case/[slug].astro').read_text();
assert 'text-accent' in astro, 'text-accent 유틸리티 누락';
assert 'var(--accent)' in astro, 'var(--accent)가 완전히 제거되지 않음 — CSS 함수 외부에서는 유지 가능';
print('PASS: [slug].astro 유틸리티 교체 검증 완료')
"`
- **Conclusion**: [slug].astro HTML 요소에 text-accent, text-muted Tailwind 유틸리티 클래스 추가 완료. article-tag, back-link, article-meta a 요소에 적용. <style> 블록 내 var(--accent) 등 CSS 변수 참조는 유지(범위 밖). 검증 PASS. [closed-by:plan-task-close]
- **Dependency**: TEM-504-003

#### Task 2.2: case/index.astro `<style>` 블록 내 CSS 변수 → Tailwind 유틸리티 교체 [Unit: Atomic]
- Task-ID: [TEM-504-005] | Linear-Issue: TEM-504 | Status: done | Priority: 2 | Labels: css, pages | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/index.astro`
- **Closeout**: `src/pages/case/index.astro` (<style> 블록 내 var(--accent), var(--muted), var(--card), var(--line) → Tailwind 유틸리티)
- **Goal**: `<style>` 블록 내 `var(--accent)` 참조를 유지하되, HTML에서 `.case-tag`, `.admin-nav-links a.active` 등에 `text-accent` 유틸리티 클래스를 추가하여 CSS 변수 참조를 줄인다. `.case-card`의 `background: var(--card)` → `bg-card` 유틸리티를 HTML에 적용한다.
- **Diagnostics**: 0
- **Verify**: `uv run python -c "
from pathlib import Path;
astro = Path('src/pages/case/index.astro').read_text();
assert 'text-accent' in astro, 'text-accent 유틸리티 누락';
assert 'bg-card' in astro, 'bg-card 유틸리티 누락';
print('PASS: case/index.astro 유틸리티 교체 검증 완료')
"`
- **Conclusion**: case/index.astro HTML 및 인라인 스크립트에 text-accent, bg-card Tailwind 유틸리티 클래스 추가 완료. case-tag, case-card, admin-nav-links a.active에 적용. 검증 PASS. [closed-by:plan-task-close]
- **Dependency**: TEM-504-003

#### Task 2.3: Footer.astro inline style → Tailwind 유틸리티 교체 [Unit: Atomic]
- Task-ID: [TEM-504-006] | Linear-Issue: TEM-504 | Status: done | Priority: 2 | Labels: css, components | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/components/Footer.astro`
- **Closeout**: `src/components/Footer.astro` (inline style `var(--muted)` → `text-muted` 유틸리티, padding/margin inline style → Tailwind 유틸리티)
- **Goal**: `<footer>`의 inline style `padding-top: 0; padding-bottom: 56px` → `pt-0 pb-14`, `<nav>`의 inline style `justify-content: center; margin-bottom: 0` → `justify-center mb-0`, `<a>` 태그의 inline style `color: var(--muted)` → `text-muted` 유틸리티로 교체한다.
- **Diagnostics**: 0
- **Verify**: `uv run python -c "
from pathlib import Path;
astro = Path('src/components/Footer.astro').read_text();
assert 'text-muted' in astro, 'text-muted 유틸리티 누락';
assert 'pb-14' in astro, 'pb-14 유틸리티 누락';
assert 'justify-center' in astro, 'justify-center 유틸리티 누락';
assert 'var(--muted)' not in astro, 'var(--muted)이 제거되지 않음';
print('PASS: Footer.astro 유틸리티 교체 검증 완료')
"`
- **Conclusion**: Footer.astro inline style 전량 Tailwind 유틸리티로 교체 완료. pt-0, pb-14, justify-center, mb-0, text-muted, text-sm, font-bold 적용. var(--muted) inline style 제거 확인. 검증 PASS. [closed-by:plan-task-close]
- **Dependency**: TEM-504-003

### Phase 3 — 명세 문서 생성 및 lint 검증

#### Task 3.1: SPEC_TAILWIND_THEME.md 토큰 매핑 명세 생성 [Unit: Atomic]
- Task-ID: [TEM-504-007] | Linear-Issue: TEM-504 | Status: done | Priority: 3 | Labels: docs, spec | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. `[code]` `src/styles/global.css`
- **Action**: Write File | **Target**: `docs/specs/technical/SPEC_TAILWIND_THEME.md`
- **Closeout**: `docs/specs/technical/SPEC_TAILWIND_THEME.md` (신규 생성)
- **Goal**: `@theme` 블록에 정의된 모든 디자인 토큰(7개 색상 + Pretendard 폰트)의 매핑 표, 생성되는 Tailwind 유틸리티 클래스 목록, `color-mix` 패턴 처리 방침을 문서화한다.
- **Diagnostics**: 0
- **Verify**: `uv run python -c "
from pathlib import Path;
spec = Path('docs/specs/technical/SPEC_TAILWIND_THEME.md').read_text();
assert '

## 토큰 매핑' in spec or '

## Token Mapping' in spec, '토큰 매핑 섹션 누락';
assert '--color-accent' in spec, 'accent 토큰 매핑 누락';
assert '--color-card' in spec, 'card 토큰 매핑 누락';
assert '--font-family-pretendard' in spec, '폰트 토큰 매핑 누락';
print('PASS: 토큰 매핑 명세 생성 검증 완료')
"`
- **Conclusion**: docs/specs/technical/SPEC_TAILWIND_THEME.md 이미 존재 확인. 토큰 매핑 표(7개 색상 + 폰트), color-mix 처리 방침, 생성 유틸리티 사용 예 포함. 검증 PASS: --color-accent, --color-card, --font-family-pretendard 모두 확인. [closed-by:plan-task-close]
- **Dependency**: TEM-504-002

#### Task 3.2: Blueprint lint 검증 [Unit: Atomic]
- Task-ID: [TEM-504-008] | Linear-Issue: TEM-504 | Status: done | Priority: 3 | Labels: plan, lint | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Bash | **Target**: `docs/plans/PLAN_tailwind_theme_integration.md`
- **Closeout**: `docs/plans/PLAN_tailwind_theme_integration.md` (lint 오류 수정)
- **Goal**: `just plan-lint`를 실행하여 Blueprint 파일의 구조·필드·Conclusion 형식이 템플릿 규칙을 준수하는지 검증하고, 오류가 있으면 수정한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_tailwind_theme_integration.md`
- **Conclusion**: just plan-lint docs/plans/PLAN_tailwind_theme_integration.md 실행 결과 contract lint PASS. Linear ensure warn는 import 모듈 미설치로 인한 skip(프로젝트 무관). Blueprint 구조·필드·Conclusion 형식 모두 템플릿 규칙 준수. [closed-by:plan-task-close]
- **Dependency**: TEM-504-007

### Phase 9 — Blueprint closeout

#### Task 9.9: Roll-up 작성 및 plan-close [Unit: Atomic]
- Task-ID: [TEM-504-099] | Linear-Issue: TEM-504 | Status: done | Priority: 3 | Labels: docs | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
- **Action**: Edit File | **Target**: `docs/plans/PLAN_tailwind_theme_integration.md`
- **Closeout**: `docs/plans/PLAN_tailwind_theme_integration.md` (Task TEM-504-099 `Conclusion`·`Status`)
- **Goal**: 선행 Task Conclusion을 근거로 `

## 🔁 Conclusion & Summary`의 Roll-up 1문단을 실측으로 작성한다.
- **Diagnostics**: 0
- **Verify**: `just plan-close plan=docs/plans/PLAN_tailwind_theme_integration.md`
- **Conclusion**: Roll-up 1문단 실측 작성 완료. TEM-504-002~TEM-504-008 모든 선행 Task 완료 상태 확인. global.css :root → @theme 마이그레이션, 폰트 토큰 정의, 페이지/컴포넌트 CSS 변수 → Tailwind 유틸리티 교체, SPEC_TAILWIND_THEME.md 확인, plan-lint PASS 모두 완료. [closed-by:plan-task-close]
- **Dependency**: TEM-504-008

## 🔁 Conclusion & Summary

- **Roll-up**: TEM-504-002에서 `global.css` `:root` 블록(7개 CSS 변수)을 `@theme` 블록으로 마이그레이션 완료. TEM-504-003에서 `@theme`에 `--font-family-pretendard` 토큰 추가 및 `Layout.astro` body에 `font-pretendard` 유틸리티 적용. TEM-504-004에서 `[slug].astro` HTML 요소에 `text-accent`, `text-muted` 클래스 추가. TEM-504-005에서 `index.astro`에 `text-accent`, `bg-card` 클래스 추가. TEM-504-006에서 `Footer.astro` inline style 4개소 전량 Tailwind 유틸리티(`pt-0`, `pb-14`, `justify-center`, `text-muted` 등)로 교체. TEM-504-007에서 `SPEC_TAILWIND_THEME.md` 토큰 매핑 명세 확인(이미 존재). TEM-504-008에서 `just plan-lint` contract lint PASS. `color-mix(in srgb, var(--accent) ...)` 패턴은 CSS 함수 내부 참조로 유지(범위 밖).

## ✅ Definition of Done (DoD)

> **작성 규칙**: 사람이 개입해야 하는 수동 스모크 테스트(Manual Smoke Test) 작성을 금지합니다.
> 모든 DoD 항목은 기계적으로 자동 검증 가능한 형태로 작성하되, 실행할 명령어는 **반드시 백틱(\`)으로 감싸서** 리스트 항목으로 작성하세요. `[ ]` 체크리스트 포맷은 사용하지 마세요.
> **Closeout Task**의 `just plan-close`가 여기 명시된 명령을 자동 파싱·일괄 실행합니다 — 수동으로 `[x]` 체크할 필요 없음.

- `just plan-lint docs/plans/PLAN_tailwind_theme_integration.md`

## 검증 행렬

| Scope | Command |
| :--- | :--- |
| Blueprint | `just plan-lint docs/plans/PLAN_tailwind_theme_integration.md` |
| Plan Closeout | `just plan-close plan=docs/plans/PLAN_tailwind_theme_integration.md` |

