import { CasePost, getCaseThumbnailKeywords } from "@/lib/cases";

type CaseThumbnailProps = {
  post: CasePost;
  variant: "card" | "detail";
};

export function CaseThumbnail({ post, variant }: CaseThumbnailProps) {
  const wrapClass = variant === "detail" ? "detail-thumb-wrap" : "thumb-wrap";
  const imageClass = variant === "detail" ? "detail-thumb" : "thumb";
  const shouldUseImage = Boolean(post.thumbnail);

  if (shouldUseImage && post.thumbnail) {
    return (
      <div className={wrapClass}>
        <img
          src={post.thumbnail}
          alt={post.title}
          className={imageClass}
        />
      </div>
    );
  }

  const keywords = getCaseThumbnailKeywords(post, 3);

  return (
    <div className={`${wrapClass} generated-thumb`}>
      <svg
        className="generated-thumb-orb"
        viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="110" cy="110" r="84" />
      </svg>
      <p className="generated-thumb-tag">{post.tag}</p>
      <p className="generated-thumb-title">{post.title}</p>
      <div className="generated-thumb-keywords">
        {keywords.map((keyword) => (
          <span key={keyword}>#{keyword}</span>
        ))}
      </div>
    </div>
  );
}
