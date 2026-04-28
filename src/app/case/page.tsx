import Link from "next/link";
import { casePosts } from "@/lib/cases";
import { CaseThumbnail } from "@/components/case-thumbnail";

export default function CaseListPage() {
  return (
    <main className="page">
      <nav className="top-nav">
        <Link href="/" scroll>
          홈으로
        </Link>
      </nav>
      <header className="hero">
        <p className="eyebrow">CASE ARCHIVE</p>
        <h1>실전 사례 모음</h1>
        <p className="lead">
          바이브코딩, Local AI, Local LLM 관련 실험 기록을 모아둔 페이지입니다.
          관심 주제부터 바로 확인해보세요.
        </p>
      </header>

      <section className="featured">
        <div className="cards">
          {casePosts.map((post, index) => (
            <article key={post.slug} className="card">
              <CaseThumbnail post={post} variant="card" />
              <span>{post.tag}</span>
              <h3>{`#${index + 1} ${post.title}`}</h3>
              <p>{post.summary}</p>
              <Link href={`/case/${post.slug}`}>자세히 읽기 →</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
