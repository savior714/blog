import Link from "next/link";
import { casePosts } from "@/lib/cases";
import { CaseThumbnail } from "@/components/case-thumbnail";
import { ArrowRightIcon, CompassIcon, HomeIcon } from "@/components/ui/icons";

export default function CaseListPage() {
  return (
    <main className="page magazine-page">
      <nav className="top-nav">
        <Link href="/" scroll className="inline-link">
          <HomeIcon className="inline-link-icon" />
          홈으로
        </Link>
      </nav>
      <header className="hero archive-hero">
        <p className="eyebrow">CASE ARCHIVE</p>
        <h1>실전 사례 모음</h1>
        <p className="lead">
          바이브코딩, Local AI, Local LLM 관련 실험 기록을 모아둔 페이지입니다.
          관심 주제부터 바로 확인해보세요.
        </p>
        <div className="archive-meta">
          <span>Total</span>
          <strong>{casePosts.length}</strong>
        </div>
      </header>

      <section className="featured">
        <div className="section-head">
          <h2>All Cases</h2>
          <span className="inline-link">
            <CompassIcon className="inline-link-icon" />
            최신순 정렬
          </span>
        </div>
        <div className="cards">
          {casePosts.map((post, index) => (
            <article key={post.slug} className="card">
              <CaseThumbnail post={post} variant="card" />
              <span>{post.tag}</span>
              <h3>{`#${index + 1} ${post.title}`}</h3>
              <p>{post.summary}</p>
              <Link href={`/case/${post.slug}`} className="inline-link">
                자세히 읽기
                <ArrowRightIcon className="inline-link-icon" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
