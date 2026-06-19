# SPEC_TECH_SEO_FUNDAMENTALS

- **문서 ID**: SPEC-TECH-001
- **상태**: Draft
- **최종 업데이트**: 2026-06-18
- **관련 Blueprint**: PLAN_SEO_FUNDAMENTALS

## 1. 목적

Savior Lab Notes 블로그의 검색 엔진 노출과 소셜 미디어 공유 품질을 표준화한다.
현재 Layout.astro에 하드코딩된 기본 OG 태그만 존재하므로, 페이지별 동적 메타데이터·RSS·Sitemap·JSON-LD를 구축한다.

## 2. 범위

### 포함

- 페이지별 동적 Open Graph / Twitter meta 태그 (og:image, og:url, twitter:image)
- RSS 피드 엔드포인트 (`/rss.xml`)
- Sitemap 생성 (`@astrojs/sitemap` 통합)
- Case 페이지 JSON-LD (Article / BlogPosting schema)

### 미포함

- OG image 자동 생성 (satori/og-image 등) — thumbnail 또는 placeholder 사용
- 다국어 SEO (hreflang) — 현재 단일 언어(KO)
- Web Vitals 최적화 — 별도 Blueprint로 분리

## 3. 기술 명세

### 3.1 Site URL 공통 설정

- `src/config/site.ts` 생성
- `SITE_URL = 'https://blog.savior714.com'` 상수 export
- Head.astro, Layout.astro, sitemap config에서 동일 import

### 3.2 Head.astro → SSOT화

- `src/components/Head.astro`를 메타태그 SSOT로 승격
- Layout.astro는 `<Head {...props} />`만 import, 직접 head 태그 작성 제거
- Head.astro props 확장:

```ts
type HeadProps = {
  title: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
  publishedAt?: string;
  modifiedAt?: string;
  tag?: string;
};
```

- 동적 og:image: `ogImage` prop이 있으면 `<meta property="og:image" content={ogImage} />`
- 동적 og:url: `ogUrl` prop이 있으면 `<meta property="og:url" content={ogUrl} />`
- Twitter card: `summary_large_image`로 변경, `twitter:image` / `twitter:title` / `twitter:description` 추가
- og:type: 페이지별 prop으로 전달 (기본 `website`, case 페이지 `article`)

### 3.3 RSS 피드

- `src/pages/rss.xml.ts` 생성
- `@astrojs/rss` 사용
- `getCollection('cases')`로 case 데이터 가져와 items 매핑
- 필드: title, pubDate (publishedAt), description (summary), link (`/case/{slug}`)
- customData: `<language>ko</language>`

### 3.4 Sitemap

- `astro.config.mjs`에 `@astrojs/sitemap` 추가
- `site: SITE_URL` 설정
- 기본 경로 (`/`, `/case`, `/editor`, `/404`) 자동 인덱싱

### 3.5 JSON-LD Structured Data

- `src/pages/case/[slug].astro`에 `<script type="application/ld+json" set:html={...}>` 추가
- schema.org Article 타입 사용:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{title}",
  "description": "{summary}",
  "datePublished": "{publishedAt}",
  "author": { "@type": "Organization", "name": "Savior Lab Notes" },
  "mainEntityOfPage": "{siteUrl}/case/{slug}",
  "image": "{thumbnail || siteUrl}/og-default.png"
}
```

- thumbnail이 없으면 placeholder og:image URL 사용

### 3.6 package.json 의존성

- `@astrojs/rss` 추가 (RSS용)
- `@astrojs/sitemap` 추가 (Sitemap용)

## 4. 검증

| 항목 | 명령어 |
| :--- | :--- |
| Blueprint lint | `just plan-lint docs/plans/archive/seo/PLAN_seo_fundamentals.md` |
| 빌드 검증 | `npx astro build` |
| RSS 엔드포인트 | `curl -s http://localhost:4321/rss.xml \| grep -c '<item>'` |
| Sitemap 존재 | `curl -s http://localhost:4321/sitemap-index.xml \| grep -c '<url>'` |
| OG 태그 존재 | `curl -s http://localhost:4321/ \| grep 'og:title'` |
| JSON-LD 존재 | `curl -s http://localhost:4321/case/test-slug \| grep '"@type": "Article"'` |

## 5. 영향 범위

| 파일 | 변경 내용 |
| :--- | :--- |
| `src/config/site.ts` | 신규 — SITE_URL 상수 |
| `src/components/Head.astro` | 확장 — props + 동적 meta + twitter:image |
| `src/components/Layout.astro` | 수정 — Head.astro import로 통합, 직접 head 제거 |
| `src/pages/rss.xml.ts` | 신규 — RSS 엔드포인트 |
| `astro.config.mjs` | 수정 — sitemap 통합 |
| `src/pages/case/[slug].astro` | 수정 — JSON-LD script 추가 |
| `package.json` | 수정 — 의존성 2개 추가 |
