export type CasePost = {
  slug: string;
  tag: "Local LLM" | "Vibe Coding" | "Local AI";
  title: string;
  summary: string;
  thumbnail?: string;
  youtubeUrl?: string;
  publishedAt: string;
};

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

  const source = `${post.title} ${post.summary}`;
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
