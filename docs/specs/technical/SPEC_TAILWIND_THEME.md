# SPEC_TAILWIND_THEME — Tailwind v4 @theme 디자인 토큰 통합 명세

## 토큰 매핑

| CSS 변수 (기존) | @theme 토큰 (신규) | 생성 유틸리티 | 색상 |
| :--- | :--- | :--- | :--- |
| `--background: #f7f9ff` | `--color-background: #f7f9ff` | `bg-background`, `text-background` | 배경색 |
| `--foreground: #21304d` | `--color-foreground: #21304d` | `text-foreground`, `border-foreground` | 본문 글자색 |
| `--muted: #627395` | `--color-muted: #627395` | `text-muted`, `bg-muted` | 보조 텍스트 |
| `--card: #ffffff` | `--color-card: #ffffff` | `bg-card`, `border-card` | 카드 배경 |
| `--line: #dbe4f6` | `--color-line: #dbe4f6` | `border-line`, `bg-line` | 구분선 |
| `--accent: #4a72e8` | `--color-accent: #4a72e8` | `text-accent`, `bg-accent`, `border-accent` | 강조색 |
| `--accent-warm: #f2b7c8` | `--color-accent-warm: #f2b7c8` | `text-accent-warm`, `bg-accent-warm` | 따뜻한 강조색 |

## 폰트 토큰

| @theme 토큰 | 값 | 생성 유틸리티 |
| :--- | :--- | :--- |
| `--font-family-pretendard: "Pretendard", sans-serif` | Pretendard (CDN) | `font-pretendard` |

## color-mix 패턴 처리 방침

`color-mix(in srgb, var(--accent) 80%, #fff)` 등 CSS 함수 내부의 변수 참조는
Tailwind가 자동 치환하지 않으므로, `@theme` 마이그레이션 후에도 기존 `var(--accent)`
참조를 CSS 함수 내부에 유지한다. 색상 토큰 값의 변경은 `@theme` 블록 한 곳에서 관리.

## 생성 유틸리티 사용 예

```html
<!-- Before -->
<a style="color: var(--accent)">링크</a>
<div style="background: var(--card)">카드</div>

<!-- After -->
<a class="text-accent">링크</a>
<div class="bg-card">카드</div>
```

## 적용 범위

- `src/styles/global.css` — `@theme` 블록 정의
- `src/pages/**/*.astro` — CSS 변수 참조 → Tailwind 유틸리티
- `src/components/**/*.astro` — inline style CSS 변수 → Tailwind 유틸리티
- `<style>` 블록 내 `var(--accent)` 등 — CSS 함수 외부 단순 color 속성은 유지 가능
