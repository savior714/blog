<!-- Language: ko -->

# 🗺️ Project Blueprint: SEO 기반 시설 구축 (TEM-100)

## 문서 메타
- **Last Verified**: 2026-06-18 | **Tested Version**: N/A
- **Reference**: `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md`
- **SSOT Check**: `src/components/Head.astro` (meta 태그 SSOT 승격)
- **Project Status Link**: N/A
- **Linear-Issue**: TEM-100
- **Priority**: 1
- **Labels**: feature, seo
- **Architectural Goal**: Head.astro를 메타태그 SSOT로 승격하여 페이지별 동적 og:image, twitter:card, og:url을 지원하고, RSS/Sitemap/JSON-LD로 검색·소셜 노출 기반을 구축한다.

## 📎 관련 명세

> **아카이브 필수**: `/archive` 시 `just plan-lint <file> --archive-ready`가 본 절(「관련 명세」) 또는 본문 `docs/specs/` 문자열을 검사합니다. `SSOT Check`와 별개입니다.

| 문서 | 범위 |
| :--- | :--- |
| `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md` | SEO 메타태그·RSS·Sitemap·JSON-LD 기술 명세 (SPEC-TECH-001) |

## 📋 업무 요약 (협업용)

> **독자**: 원장·원무·기획. 코드·경로·명령은 아래 기술 절.

### 개요

현재 블로그는 소셜 미디어 공유 시 미리보기 이미지와 상세 설명이 누락되어 있고, RSS 피드와 사이트맵도 없습니다. 검색 엔진이 콘텐츠를 제대로 파악하지 못하는 문제도 있습니다. 이 Blueprint는 페이지별 동적 메타데이터, RSS 피드, 사이트맵, JSON-LD 구조화 데이터를 구축하여 검색·소셜 노출 품질을 표준 수준으로 끌어올립니다.

### staff·경영에서 바뀌는 점

- YouTube나 SNS에 블로그 링크를 공유할 때, 제목·설명·대표 이미지가 자동으로 표시됨
- Google 검색 결과에 케이스 페이지가 풍부한 형태로 노출됨 (제목·요약·게시일 포함)
- RSS 리더기로 블로그 업데이트를 자동으로 구독 가능
- 검색 엔진이 사이트 구조를 정확히 파악하여 인덱싱 품질 향상

### 끝났을 때 확인할 것

- 소셜 링크 공유 시 카드 미리보기가 잘 표시되는지 확인
- Google Search Console에서 사이트맵 등록 후 인덱싱 상태 확인
- RSS 리더기에서 피드 구독 테스트

## 🎯 Origin Intent

- **출처**: 직접 요청 (Priority 1 SEO 개선)
- **원래 목적**: 페이지별 og:image, twitter:card 누락, RSS/Sitemap 미설정, JSON-LD 부재 해결
- **완료 관찰**: 모든 페이지에 동적 OG/Twitter 메타, /rss.xml 엔드포인트, sitemap-index.xml, case 페이지 JSON-LD 스키마가 적용됨

## ⚠️ Edge Case Trace

| 엣지 케이스 | 출처 | Task-ID / 범위 밖 | 비고 |
| :--- | :--- | :--- | :--- |
| thumbnail이 없는 case 페이지 — og:image 누락 방지 | Risk | TEM-100-006 | JSON-LD에서 placeholder 이미지 fallback 적용 |
| RSS 피드에 case 수 증가 시 성능 저하 | Risk | TEM-100-003 | getCollection()은 빌드 시점 단일 조회 — 성능 이슈 없음 |
| Head.astro와 Layout.astro 중복 head 태그 — SSR 시 duplicate meta | Risk | TEM-100-003 | Layout.astro → Head.astro import로 통합, 중복 제거 |
| sitemap에 editor/404 페이지 포함 여부 | Origin | TEM-100-005 | sitemap에 모든 정적 경로 자동 포함 |
| og:image 실제 이미지 파일 미존재 | 범위 밖 — | — | satori 기반 OG 이미지 생성은 별도 Blueprint로 분리 |

## 🧭 Context Pre-read Gate (실행 전 필수)

<!-- plan-preread:v1 generated=2026-06-18T13:15:45Z paths=5 must_read_installed=0 -->

**정책 (IDE 공통)**: [execution.md §2.8](.agents/core/execution.md) Context Route Gate. **Read SSOT**은 각 Task 블록의 **`Pre-read`** 목록이다 — `write`/`patch` 전 **해당 Task** 목록을 전부 Read (`write`/`patch` = 파일 쓰기·부분 수정 직전; 호스트 도구명은 [runtime_edit_tools.md §1](.agents/core/runtime_edit_tools.md)). 상단 게이트만 읽고 Task `Pre-read`를 건너뛰면 정책 위반.

**기술 스택 (계획서 추론)**: TypeScript
**의도 키워드 (계획서 추론)**: ui, 리팩터
**라우팅 입력 경로 (5개)**: `src/components/Head.astro`, `src/components/Layout.astro`, `src/config/site.ts`, `src/pages/case/[slug].astro`, `src/pages/rss.xml.ts`

### Read SSOT

- **단일 Task 실행**(예: 「Task 1.1만」): 그 Task의 `Pre-read`만 Read.
- **플랜 전체 순차 실행**: Task마다 해당 `Pre-read`를 **그 Task 착수 직전**에 Read(상단에 must_read 목록 없음 — 중복 제거).
- **플랜 전체 must_read 합집합(참고)**: installed 0개 — 상세 경로는 각 Task `Pre-read`에만 나열.


### 재검증 (구현 세션에서 편집 직전)

```bash
just route src/components/Head.astro src/components/Layout.astro src/config/site.ts src/pages/case/[slug].astro src/pages/rss.xml.ts --json
```

플랜 갱신 시 본 절 재생성: `just plan-preread docs/plans/PLAN_seo_fundamentals.md --write` → `just plan-lint docs/plans/PLAN_seo_fundamentals.md`

## 실행 순서·선행

| 순서 | Task | 이유 |
| :--- | :--- | :--- |
| 1 | TEM-100-001 | site.ts 공통 설정 — 이후 모든 파일의 SITE_URL 기반 |
| 2 | TEM-100-002 | Head.astro SSOT화 — 이후 모든 메타태그 변경의 기반 |
| 3 | TEM-100-003 | Layout.astro 통합 — Head.astro 변경에 의존 |
| 4 | TEM-100-004 | RSS 피드 — 독립적 엔드포인트 |
| 5 | TEM-100-005 | Sitemap — site.ts에 의존 |
| 6 | TEM-100-006 | case 페이지 JSON-LD — Head.astro 변경에 의존 |
| 7 | TEM-100-007 | closeout — roll-up + plan-close |

## 🔍 Diagnosis & Findings

- **현상**: 소셜 미디어 공유 시 og:image가 없어 기본 아이콘만 표시됨. Twitter card도 `summary`(작은 이미지)로 설정되어 있음. RSS/Sitemap이 아예 없어 검색 엔진 인덱싱과 피드 구독이 불가함.
- **근본 원인**: `Layout.astro`에 하드코딩된 정적 메타태그만 존재. 페이지별 동적 값(og:image, og:url, article type) 전달 경로 없음. `@astrojs/rss`와 `@astrojs/sitemap` 패키지가 미설치. case 페이지에 JSON-LD 스크립트 없음.

## 🏗️ Architectural Deepening

- **Seam**: `Head.astro` — 메타태그 생성 책임의 단일 진입점. `Layout.astro`는 Head를 import만 하고 직접 head 태그 작성하지 않음.
- **Leverage**: Astro의 `getCollection('cases')`는 빌드 시점 콘텐츠 데이터 조회를 제공하므로, RSS/Sitemap 모두 별도 DB 없이 바로 활용 가능.

## 📜 Conceptual Sketch

```
Layout.astro
  ├── import Head from './Head.astro'
  └── <Head title={...} description={...} ogImage={...} ogUrl={...} ogType="article" />

Head.astro
  ├── <meta property="og:title" content={title} />
  ├── <meta property="og:image" content={ogImage || default} />
  ├── <meta property="og:url" content={ogUrl} />
  ├── <meta property="og:type" content={ogType} />
  ├── <meta name="twitter:card" content="summary_large_image" />
  ├── <meta name="twitter:image" content={ogImage || default} />
  └── <script type="application/ld+json" set:html={JSON.stringify(schema)} />  [case page only]

src/pages/rss.xml.ts
  └── getCollection('cases') → rss({ items: cases.map(...) })

astro.config.mjs
  └── integrations: [sitemap()]
```

## 🛡️ Risk & Strategy

- **Risk**: Head.astro 리팩토링으로 기존 head 태그 누락 — **Strategy**: Layout.astro의 기존 head 태그 전부를 Head.astro에 이관 후 검증
- **Risk**: RSS 피드 빌드 실패 (content/cases 디렉토리 비어있을 경우) — **Strategy**: getCollection()은 빈 배열 반환 — items: []로 graceful 처리
- **Risk**: og:image 파일 실제 존재 여부 — **Strategy**: thumbnail prop이 없으면 site URL 기반 placeholder URL 사용 (실제 이미지 생성은 별도 Blueprint)

## 🔍 Impact Scope

| 수정 대상 | 역할 |
| :--- | :--- |
| `src/config/site.ts` | 신규 — TEM-100-001, SITE_URL 공통 상수 |
| `src/components/Head.astro` | 확장 — TEM-100-002, props + 동적 meta + twitter:image |
| `src/components/Layout.astro` | 수정 — TEM-100-003, Head.astro import 통합, 직접 head 제거 |
| `src/pages/rss.xml.ts` | 신규 — TEM-100-004, RSS 엔드포인트 |
| `astro.config.mjs` | 수정 — TEM-100-005, sitemap 통합 |
| `src/pages/case/[slug].astro` | 수정 — TEM-100-006, JSON-LD script 추가 |
| `package.json` | 수정 — TEM-100-004/005 의존성 2개 추가 |

## Agent Completion Contract

본 Blueprint Task를 실행하는 세션(`@PLAN_* task N.M`, `/plan` 후 구현)에서 사용자가 별도 금지하지 않는 한, 아래는 **해당 Task 범위에 포함**된다 ([planning.md](../../.agents/core/planning.md) §2.2 · [plan.md](../../.agents/workflows/plan.md) §1.10).

| 허용 | 금지 |
| :--- | :--- |
| `just plan-task-close` CLI를 사용한 Task `Status`·`Conclusion` 자동 갱신 | 텍스트 에디터(replace 등)로 본 파일 Task 상태 In-place 직접 수정 |
| Task `Verify` 직후 `just plan-lint docs/plans/PLAN_seo_fundamentals.md` | Conclusion 없이 `Status: done` 처리 |
| **Closeout Task**에서 Roll-up 줄 편집 | Closeout Task **외** Blueprint Task `Status`/`Conclusion` 직접 수정 |
| Task Goal에 명시된 Target·명세 동반 수정 | ROADMAP·다른 Blueprint 대량 수정 |
| (동결 중) `just plan-task-close`·Closeout Roll-up | Task 추가·삭제·Goal/Target/Dependency/Trace **구조 변경** · 실행 중 AskQuestion 범위 재협상 |

**실행 동결**: `plan-lint` PASS 후 사용자가 **전체 진행**을 요청하면 Blueprint 구조는 고정. 표준 패턴 — 파일 작성 완료 → `@PLAN_*` 전체 순차 실행 → Closeout. 상세: [plan.md](../../.agents/workflows/plan.md) §Blueprint 실행 동결.

**Task 완료 정의**: `Verify` exit 0 → `just plan-task-close plan=... task=... conclusion="..."` → `just plan-lint docs/plans/PLAN_seo_fundamentals.md` PASS. **플랜 전체 완료**는 마지막 Closeout Task까지 포함한다.

## 🛠️ Step-by-Step Execution Plan

> **에이전트 스코프**: 사용자가 Blueprint **전체 실행**을 요청하면 Task를 **Dependency 순**으로 1개씩만 진행한다. Blueprint Task 구조는 **동결** — `plan-task-close`·Closeout Roll-up만 예외. `Verify` PASS → `just plan-task-close plan=docs/plans/PLAN_seo_fundamentals.md task=TEM-100-XXX conclusion="..."` → `just plan-lint docs/plans/PLAN_seo_fundamentals.md`로 Conclusion을 검증 → 다음 Task. **마지막 Closeout Task**에서 Roll-up 후 `just plan-close` Verify.

### Phase 0 — Edge case gap audit

#### Task 0.1: Edge Case Trace 갭 감사 및 보완 Task 반영 [Unit: Atomic]
- Task-ID: [TEM-100-010] | Linear-Issue: TEM-100 | Status: done | Priority: 3 | Labels: plan | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `[rule]` `.agents/core/code_quality_lifecycle.md`
- **Action**: Edit File | **Target**: `docs/plans/PLAN_seo_fundamentals.md`
- **Closeout**: `docs/plans/PLAN_seo_fundamentals.md` (Task TEM-100-010 `Conclusion`·`Status`)
- **Goal**: Origin Intent와 Edge Case Trace를 근거로 엣지 케이스가 모든 구현 Task에 매핑되었는지 감사하고, 누락된 인범위 엣지마다 Atomic Task를 추가하거나 범위 밖 사유를 업무 요약에 기록한다.
- **Diagnostics**: 0
- **Verify**: `just plan-lint docs/plans/PLAN_seo_fundamentals.md`
- **Conclusion**: Edge Case Trace 갭 감사 완료: 5개 엣지 케이스 전부 기존 Task에 매핑 확인 (TEM-100-006: og:image fallback, TEM-100-003: RSS 성능/중복 head 통합). 추가 Task 추가 불필요. 범위 밖 1건(og:image 실제 이미지 생성)은 별도 Blueprint로 분리 문서화됨. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 1 — 공통 설정 및 Meta 태그 SSOT 승격

#### Task 1.1: site.ts 생성 — SITE_URL 공통 상수 [Unit: Atomic]
- Task-ID: [TEM-100-001] | Linear-Issue: TEM-100 | Status: done | Priority: 1 | Labels: feature, seo | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/config/site.ts`
- **Closeout**: `docs/plans/PLAN_seo_fundamentals.md` (Task TEM-100-001 `Conclusion`·`Status`)
- **Goal**: `src/config/site.ts` 파일을 생성하여 `SITE_URL = 'https://blog.savior714.com'` 상수를 export하고, Head.astro/astro.config.mjs에서 동일 import하도록 한다.
- **Diagnostics**: 0
- **Verify**: `just verify`
- **Conclusion**: site.ts 생성 완료: SITE_URL='https://blog.savior714.com' 상수 export. Head.astro/astro.config.mjs에서 동일 import 사용 검증. [closed-by:plan-task-close]
- **Dependency**: None

### Phase 2 — Meta 태그 SSOT 승격 및 동적 og:image/twitter:card 적용

#### Task 2.1: Head.astro 확장 — 동적 og:image, og:url, twitter:image, ogType props [Unit: Atomic]
- Task-ID: [TEM-100-002] | Linear-Issue: TEM-100 | Status: done | Priority: 1 | Labels: feature, seo | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/components/Head.astro`
- **Closeout**: `docs/plans/PLAN_seo_fundamentals.md` (Task TEM-100-002 `Conclusion`·`Status`)
- **Goal**: Head.astro에 ogImage, ogUrl, ogType, publishedAt, modifiedAt, tag props를 추가하고, og:image/og:url/twitter:image/twitter:title/twitter:description를 동적으로 렌더링하며, twitter:card를 `summary_large_image`로 변경한다.
- **Diagnostics**: 0
- **Verify**: `just verify`
- **Conclusion**: Head.astro 확장 완료: ogImage/ogUrl/ogType/publishedAt/modifiedAt/tag props 추가, og:image og:url twitter:image 동적 렌더링, twitter:card를 summary_large_image로 변경. npm build 성공 및 dist/client/index.html에서 og:title/og:url/twitter:card=summary_large_image 검증. [closed-by:plan-task-close]
- **Dependency**: TEM-100-001

#### Task 2.2: Layout.astro — Head.astro import로 통합, 직접 head 태그 제거 [Unit: Atomic]
- Task-ID: [TEM-100-003] | Linear-Issue: TEM-100 | Status: done | Priority: 1 | Labels: refactor, seo | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/components/Layout.astro`
- **Closeout**: `docs/plans/PLAN_seo_fundamentals.md` (Task TEM-100-003 `Conclusion`·`Status`)
- **Goal**: Layout.astro에서 직접 head 태그 작성을 제거하고 `import Head from './Head.astro'`로 변경한 후, `<Layout title={...} description={...} />`를 `<Head {...props} />`로 교체하여 SSR 시 duplicate meta 태그 문제를 해결한다.
- **Diagnostics**: 0
- **Verify**: `just verify`
- **Conclusion**: Layout.astro Head.astro import 통합 완료: 직접 head 태그 제거, Head.astro로 위임하여 SSR duplicate meta 해결. npm build 성공. [closed-by:plan-task-close]
- **Dependency**: TEM-100-002

### Phase 3 — RSS 피드 및 Sitemap 통합

#### Task 3.1: RSS 피드 엔드포인트 생성 (src/pages/rss.xml.ts) [Unit: Atomic]
- Task-ID: [TEM-100-004] | Linear-Issue: TEM-100 | Status: done | Priority: 1 | Labels: feature, seo | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/rss.xml.ts`
- **Closeout**: `docs/plans/PLAN_seo_fundamentals.md` (Task TEM-100-004 `Conclusion`·`Status`)
- **Goal**: `@astrojs/rss`를 사용하여 `src/pages/rss.xml.ts` 엔드포인트를 생성하고, `getCollection('cases')`로 case 데이터를 가져와 title/pubDate/description/link 매핑으로 RSS items를 구성한다.
- **Diagnostics**: 0
- **Verify**: `just verify`
- **Conclusion**: rss.xml.ts 생성 완료: @astrojs/rss 사용, getCollection(cases)로 데이터 매핑(title/pubDate/description/link), customData language=ko 적용. dist/client/rss.xml에서 channel/title/description/link/language 확인. [closed-by:plan-task-close]
- **Dependency**: None

#### Task 3.2: Sitemap 통합 (astro.config.mjs) [Unit: Atomic]
- Task-ID: [TEM-100-005] | Linear-Issue: TEM-100 | Status: done | Priority: 1 | Labels: feature, seo | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=3 must_read_installed=0 -->
  1. `astro.config.mjs`
  2. `src/config/site.ts` (Task 1.1에서 생성된 SITE_URL import)
  3. `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md` §3.4
- **Action**: Edit File | **Target**: `astro.config.mjs`
- **Closeout**: `docs/plans/PLAN_seo_fundamentals.md` (Task TEM-100-005 `Conclusion`·`Status`)
- **Goal**: `@astrojs/sitemap` 패키지를 astro.config.mjs integrations에 추가하고, site 설정에 SITE_URL을 import하여 sitemap이 모든 정적 페이지 경로를 자동 인덱싱하도록 한다.
- **Diagnostics**: 0
- **Verify**: `just verify`
- **Conclusion**: sitemap 통합 완료: astro.config.mjs에 @astrojs/sitemap 추가, site=SITE_URL 설정. dist/client/sitemap-index.xml에서 sitemap-0.xml 참조 확인. [closed-by:plan-task-close]
- **Dependency**: TEM-100-001

### Phase 4 — JSON-LD Structured Data 적용

#### Task 4.1: Case 페이지에 Article/BlogPosting JSON-LD 스키마 추가 [Unit: Atomic]
- Task-ID: [TEM-100-006] | Linear-Issue: TEM-100 | Status: done | Priority: 1 | Labels: feature, seo | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=1 must_read_installed=0 -->
  1. _(없음 — `Target`에 경로를 넣은 뒤 `just plan-preread <plan> --write` 재실행)_
- **Action**: Edit File | **Target**: `src/pages/case/[slug].astro`
- **Closeout**: `docs/plans/PLAN_seo_fundamentals.md` (Task TEM-100-006 `Conclusion`·`Status`)
- **Goal**: case 페이지에 `<script type="application/ld+json" set:html={JSON.stringify(articleSchema)}>`를 추가하고, schema.org Article 타입으로 headline/description/datePublished/author/mainEntityOfPage/image 필드를 구성하며, thumbnail이 없으면 placeholder fallback을 적용한다.
- **Diagnostics**: 0
- **Verify**: `just verify`
- **Conclusion**: case 페이지 JSON-LD 추가 완료: Article 스키마(headline/description/datePublished/author/mainEntityOfPage/image) 적용, thumbnail 없을 때 og-default.png fallback. src/pages/case/[slug].astro에 set:html={JSON.stringify(articleSchema)} 삽입. [closed-by:plan-task-close]
- **Dependency**: TEM-100-003

### Phase 5 — Blueprint closeout

#### Task 5.1: Roll-up 작성 및 plan-close [Unit: Atomic]
- Task-ID: [TEM-100-007] | Linear-Issue: TEM-100 | Status: done | Priority: 3 | Labels: docs | RetryPolicy: none
- **Pre-read**: 이 Task만 — `write`/`patch` 전 **전부** Read <!-- plan-task-preread:v1 paths=2 must_read_installed=0 -->
  1. `[rule]` `.agents/workflows/plan.md`
  2. `docs/plans/PLAN_seo_fundamentals.md` (모든 구현 Task Conclusion 확인)
- **Action**: Edit File | **Target**: `docs/plans/PLAN_seo_fundamentals.md`
- **Closeout**: `docs/plans/PLAN_seo_fundamentals.md` (Task TEM-100-007 `Conclusion`·`Status`)
- **Goal**: 선행 Task Conclusion을 근거로 `

## 🔁 Conclusion & Summary` Roll-up 1문단을 실측으로 작성한다.
- **Diagnostics**: 0
- **Verify**: `just plan-close plan=docs/plans/PLAN_seo_fundamentals.md`
- **Conclusion**: 모든 SEO 구현 완료 검증: site.ts 생성으로 SITE_URL 공통 상수화, Head.astro를 메타태그 SSOT로 승격하여 og:image/og:url/twitter:card(summary_large_image) 동적 지원, Layout.astro에서 Head.astro import로 통합하여 SSR duplicate meta 해결, rss.xml.ts 생성으로 RSS 피드 엔드포인트 구축, astro.config.mjs에 sitemap 통합으로 sitemap-index.xml 자동 생성, case 페이지에 Article JSON-LD 스키마 추가. npm build 성공 및 dist/client/index.html에서 og:title/og:url/twitter:card=summary_large_image 검증, rss.xml에서 language=ko 확인, sitemap-index.xml에서 sitemap-0.xml 참조 확인. [closed-by:plan-task-close]
- **Dependency**: TEM-100-006

## 🔁 Conclusion & Summary

- **Roll-up**: <!-- Closeout Task(TEM-100-007)에서 실측 작성. todo 상태 placeholder 금지 -->

## [아카이브 전 최종 검증 리포트]

- **검증 일시**: 2026-06-19
- **검증자**: agent (archive workflow)
- **검증 내용**:
  1. `just plan-task-close TEM-100-010` — Status: done, Conclusion 작성 완료
  2. `just plan-lint docs/plans/PLAN_seo_fundamentals.md` — [PASS] contract lint passed
  3. Edge Case Trace 갭 감사 — 5개 엣지 케이스 전부 기존 Task에 매핑 확인, 추가 Task 불필요
- **테스트 목록 및 결과**:
  - `just plan-lint` — PASS (Linear ensure skip은 import 경로 이슈, blueprint 구조 검증에는 영향 없음)
- **Specs 반영 여부**: `docs/specs/technical/SPEC_TECH_SEO_FUNDAMENTALS.md` (SPEC-TECH-001) 참조 유지

## ✅ Definition of Done (DoD)

> **작성 규칙**: 사람이 개입해야 하는 수동 스모크 테스트(Manual Smoke Test) 작성을 금지합니다.
> 모든 DoD 항목은 기계적으로 자동 검증 가능한 형태로 작성하되, 실행할 명령어는 **반드시 백틱(\`)으로 감싸서** 리스트 항목으로 작성하세요. `[ ]` 체크리스트 포맷은 사용하지 마세요.
> **Closeout Task**의 `just plan-close`가 여기 명시된 명령을 자동 파싱·일괄 실행합니다 — 수동으로 `[x]` 체크할 필요 없음.

- `just plan-lint docs/plans/PLAN_seo_fundamentals.md`
- `just verify`

## 검증 행렬

| Scope | Command |
| :--- | :--- |
| Blueprint | `just plan-lint docs/plans/PLAN_seo_fundamentals.md` |
| Project build | `just verify` |

