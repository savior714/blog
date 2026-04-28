export type CasePost = {
  slug: string;
  tag: "Local LLM" | "Vibe Coding" | "Local AI";
  title: string;
  summary: string;
  thumbnail?: string;
  youtubeUrl?: string;
  publishedAt: string;
  content: string[];
};

export const casePosts: CasePost[] = [
  {
    slug: "local-llm-transcript-summary",
    tag: "Local LLM",
    title: "로컬 LLM으로 영상 대본 요약 자동화하기",
    summary:
      "유튜브 업로드 후 대본을 수집하고, 로컬 LLM으로 핵심만 요약한 워크플로를 정리했습니다.",
    thumbnail: "/cases/local-llm-transcript-summary.svg",
    publishedAt: "2026-04-28",
    content: [
      "이번 실험의 목표는 유튜브 영상 업로드 이후 반복되는 요약 작업을 자동화하는 것이었습니다.",
      "Whisper 기반 대본 생성 후, 로컬 LLM으로 TL;DR, 핵심 포인트, 체크리스트를 분리 생성했습니다.",
      "핵심은 프롬프트를 고정 템플릿으로 관리하고, 영상 길이별 요약 길이 규칙을 둔 점입니다.",
      "결과적으로 업로드 후 10분 내에 블로그 초안이 생성되어 후편집 시간이 크게 줄었습니다.",
    ],
  },
  {
    slug: "vibe-coding-mvp-48-hours",
    tag: "Vibe Coding",
    title: "바이브코딩으로 사이드 프로젝트 MVP 48시간 완성",
    summary:
      "아이디어에서 배포까지 실제로 막혔던 지점과 해결 과정을 케이스 형태로 공유합니다.",
    thumbnail: "/cases/vibe-coding-mvp-48-hours.svg",
    publishedAt: "2026-04-28",
    content: [
      "초기 6시간은 기능보다 사용자 흐름을 빠르게 텍스트로 고정하는 데 집중했습니다.",
      "AI 에이전트에는 구현보다 리팩터링과 테스트 우선순위를 분리 지시해 충돌을 줄였습니다.",
      "중간에 스코프가 커지기 쉬워 '데모 성공 조건'을 3개만 남기고 나머지는 백로그로 이동했습니다.",
      "48시간 내 MVP 배포 목표는 달성했고, 이후 확장 포인트를 문서화해 다음 스프린트로 넘겼습니다.",
    ],
  },
  {
    slug: "local-ai-stack-on-mac",
    tag: "Local AI",
    title: "Local AI 스택: Mac에서 안정적으로 돌리는 기본 세팅",
    summary:
      "모델 선택, 메모리 전략, 프롬프트 템플릿까지 재현 가능한 최소 세팅을 기록했습니다.",
    thumbnail: "/cases/local-ai-stack-on-mac.svg",
    publishedAt: "2026-04-28",
    content: [
      "가벼운 실험용 모델과 실전 응답용 모델을 분리해 품질과 속도 균형을 맞췄습니다.",
      "메모리와 컨텍스트 윈도우는 워크로드 기준으로 기본값을 정하고, 실험 시에만 확장했습니다.",
      "프롬프트는 목적별로 템플릿화해 재사용하고, 실패 프롬프트는 별도로 축적했습니다.",
      "이 기본 세팅만으로도 대부분의 개인 자동화 시나리오를 안정적으로 운영할 수 있었습니다.",
    ],
  },
];

export function getCaseBySlug(slug: string) {
  return casePosts.find((post) => post.slug === slug);
}

export function getCaseNumberBySlug(slug: string) {
  const index = casePosts.findIndex((post) => post.slug === slug);
  return index >= 0 ? index + 1 : null;
}

export function hasYoutubeVideo(post: CasePost) {
  const url = post.youtubeUrl?.trim();
  if (!url) {
    return false;
  }
  return url !== "https://youtube.com/" && url !== "https://www.youtube.com/";
}

export function getCaseThumbnailKeywords(post: CasePost, max = 3) {
  const stopWords = new Set([
    "이번",
    "이후",
    "관련",
    "기반",
    "실험",
    "기록",
    "정리",
    "하고",
    "으로",
    "에서",
    "로컬",
    "local",
    "vibe",
    "coding",
  ]);

  const source = `${post.title} ${post.summary} ${post.content.join(" ")}`;
  const tokens = source
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !stopWords.has(token));

  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([token]) => token);
}
