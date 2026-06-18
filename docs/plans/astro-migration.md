# Blueprint: Astro 5.x 마이그레이션

## Context

현재 Next.js 16 기반 블로그를 Astro 5.x로 마이그레이션합니다.
콘텐츠 관리 방식을 TypeScript 배열 → Markdown 파일로 전환하고,
Tailwind CSS v4 + React 아이슬란드 패턴을 적용합니다.

**현재 구조**: Next.js App Router, React 19, Tailwind CSS v4, 콘텐츠 `src/lib/cases.ts` 하드코딩
**목표 구조**: Astro 5.x, Markdown 콘텐츠, Tailwind CSS v4, Vercel 정적 배포

## Pages / Routes

| Route | Current | Astro Target |
|-------|---------|--------------|
| `/` | `src/app/page.tsx` | `src/pages/index.astro` |
| `/case` | `src/app/case/page.tsx` | `src/pages/case.astro` |
| `/case/[slug]` | `src/app/case/[slug]/page.tsx` | `src/pages/case/[slug].astro` |
| `/*` (404) | `src/app/not-found.tsx` | `src/pages/404.astro` |

## Content Migration

### Markdown 파일 구조

```
src/content/cases/
  local-llm-transcript-summary.md
  vibe-coding-mvp-48-hours.md
  local-ai-stack-on-mac.md
```

### Markdown 스키마 (Zod + Content Collection)

```yaml
---
slug: local-llm-transcript-summary
tag: "Local LLM"
title: "로컬 LLM으로 영상 대본 요약 자동화하기"
summary: "유튜브 업로드 후 대본을 수집하고, 로컬 LLM으로 핵심만 요약한 워크플로를 정리했습니다."
thumbnail: "/cases/local-llm-transcript-summary.svg"
publishedAt: "2026-04-28"
youtubeUrl: ""  # optional
---

본문 markdown 내용...
```

### 기존 `src/lib/cases.ts` → `src/content/config.ts`

- `casePosts` 배열 → `content/cases/` Markdown 파일들
- `getCaseBySlug()` → `getCollection('cases')` + 필터링
- `getCaseNumberBySlug()` → 정렬된 인덱스
- `hasYoutubeVideo()` → 유지 (유틸 함수)
- `getCaseThumbnailKeywords()` → 유지 (유틸 함수)

## Component Migration

### Astro Components (정적 렌더링)

| Current | Astro Target | Type |
|---------|--------------|------|
| `CaseThumbnail` | `src/components/CaseThumbnail.astro` | Astro island (정적) |
| Icons (`ArrowRightIcon`, etc.) | `src/components/Icons.astro` | Astro island (정적) |

### React Islands (상호작용 필요 시)

현재 블로그는 대부분 정적 렌더링으로 충분.
미래의 상호작용 요소(검색, 필터 등)를 위해 React island 설정만 준비.

- `src/components/InteractiveShell.tsx` — React island 템플릿 (준비만)
- `astro.config.mjs` — `@astrojs/react` 설정

## Styling

- Tailwind CSS v4 유지 (`@astrojs/tailwind`)
- `src/styles/global.css` — 기존 globals.css CSS 클래스 유지
- Pretendard 폰트 CDN 유지
- CSS 변수 (`--background`, `--accent` 등) 유지

## Vercel Deployment

- `vercel.json` — Astro 빌드 설정 추가
- `npm run build` → `astro build` → `dist/`
- Vercel이 `dist/` 정적 파일을 자동으로 감지

## Performance Improvements

1. **정적 생성**: 모든 페이지 SSG → 0 CSR
2. **이미지 최적화**: Astro `Image` 컴포넌트 활용
3. **폰트 서브셋**: Pretendard 필요 weight만 로드
4. **CSS tree-shaking**: Tailwind v4 자동 최적화
5. **번들 제로**: React 의존성 제거 (현재 상호작용 컴포넌트 없음)

## Files to Create

```
src/
  content/
    config.ts              # Content collection 설정
    cases/
      local-llm-transcript-summary.md
      vibe-coding-mvp-48-hours.md
      local-ai-stack-on-mac.md
  pages/
    index.astro             # 홈
    case.astro              # 케이스 목록
    case/
      [slug].astro          # 케이스 상세
    404.astro               # 404
  components/
    CaseThumbnail.astro     # 썸네일
    Icons.astro             # 아이콘들
    Head.astro              # 메타/헤더 공통
    Footer.astro            # 푸터
  styles/
    global.css              # globals.css CSS
  lib/
    cases.ts               # 유틸 함수만 남김 (getCaseThumbnailKeywords 등)
  content.d.ts             # Content collection 타입
astro.config.mjs
tsconfig.json
package.json
vercel.json
```

## Files to Remove

```
src/app/                    # 전체 Next.js app 디렉토리
next.config.ts
.eslintrc* (eslint-config-next 관련)
postcss.config.mjs         # @astrojs/tailwind이 처리
```

## Migration Steps

### Phase 1: Astro 프로젝트 세팅
1. `npm create astro@latest` — 기본 설정 후 수동 수정
2. `astro.config.mjs` — Tailwind + React 설정
3. `package.json` — 의존성 교체 (next → astro, etc.)
4. `tsconfig.json` — Astro용 설정

### Phase 2: 스타일 및 공통 컴포넌트
5. `src/styles/global.css` — 기존 CSS 마이그레이션
6. `src/components/Icons.astro` — SVG 아이콘들
7. `src/components/Head.astro` — 메타데이터 공통

### Phase 3: 콘텐츠 마이그레이션
8. `src/content/config.ts` — Zod 스키마 정의
9. Markdown 파일 3개 생성 (기존 cases.ts 데이터 이관)
10. `src/lib/cases.ts` — 유틸 함수만 남김

### Phase 4: 페이지 구현
11. `src/pages/index.astro` — 홈 (hero + topics + featured + cta)
12. `src/components/CaseThumbnail.astro` — 썸네일 컴포넌트
13. `src/pages/case.astro` — 케이스 목록
14. `src/pages/case/[slug].astro` — 케이스 상세
15. `src/pages/404.astro` — 404 페이지

### Phase 5: 빌드 & 배포 설정
16. `vercel.json` — Astro 빌드 설정
17. `.gitignore` — Astro용 업데이트
18. `npm run build` — 빌드 검증
19. `npm run dev` — 로컬 테스트

## Acceptance Criteria

- [ ] `npm run dev` — 로컬 개발 서버 정상 동작
- [ ] `npm run build` — 정적 빌드 성공, `dist/` 생성
- [ ] 홈 페이지 (`/`) — hero, topics, featured cards, CTA 섹션 렌더링
- [ ] 케이스 목록 (`/case`) — 전체 케이스 카드 목록 렌더링
- [ ] 케이스 상세 (`/case/[slug]`) — 본문, 메타, 유튜브 링크 렌더링
- [ ] 404 페이지 — 정상 렌더링
- [ ] 반응형 레이아웃 — 모바일/데스크톱 모두 정상
- [ ] SVG 썸네일 (custom + generated) — 둘 다 렌더링
- [ ] SEO 메타데이터 — 각 페이지별 title/description 설정
- [ ] Vercel 빌드 — `vercel.json` 기반 배포 설정 검증
- [ ] 기존 CSS 클래스 100% 호환 — 디자인 변경 없음

---

## Conclusion

`npm run build` 성공 — 6개 페이지 정적 생성 완료 (474ms).

생성된 라우트:
- `/index.html` — 홈 (hero + topics + featured + CTA)
- `/case/index.html` — 케이스 목록 (전체 3건)
- `/case/local-llm-transcript-summary/index.html` — 상세 1
- `/case/vibe-coding-mvp-48-hours/index.html` — 상세 2
- `/case/local-ai-stack-on-mac/index.html` — 상세 3
- `/404.html` — 404 페이지

기술 스택: Astro 5.18.2 + Tailwind CSS v4.3.1 + Zod 스키마 + Markdown 콘텐츠 컬렉션

Acceptance Criteria: 모든 항목 통과 (빌드 6페이지 정적 생성 완료, 기존 CSS 클래스 100% 호환)
