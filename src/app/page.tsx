import Link from "next/link";
import { casePosts } from "@/lib/cases";
import { CaseThumbnail } from "@/components/case-thumbnail";
import { ArrowRightIcon, CompassIcon } from "@/components/ui/icons";

export default function Home() {
  const featuredPosts = casePosts.slice(0, 3);

  return (
    <main className="page magazine-page">
      <section className="hero-shell">
        <header className="hero-panel">
          <p className="eyebrow">SAVIOR LAB NOTES</p>
          <h1>Build with AI, Ship with Clarity.</h1>
          <p className="lead">
            바이브코딩과 로컬 AI 실험을 케이스 단위로 기록합니다. 유튜브에서 다루지
            못한 구현 맥락과 설정값을 이곳에 정리합니다.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="#featured">
              대표 사례 보기
            </Link>
            <a
              className="button ghost"
              href="https://github.com/savior714/blog"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </header>
        <aside className="hero-aside">
          <p className="eyebrow">THIS WEEK</p>
          <p className="hero-aside-number">{String(casePosts.length).padStart(2, "0")}</p>
          <p className="hero-aside-copy">Published AI building cases</p>
          <svg
            className="hero-orbit"
            viewBox="0 0 260 260"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="130" cy="130" r="108" />
            <circle cx="130" cy="130" r="70" />
          </svg>
        </aside>
      </section>

      <section className="topics topics-editorial" aria-label="주요 주제">
        <p>핵심 주제</p>
        <ul>
          <li>Vibe Coding</li>
          <li>Local AI Workflow</li>
          <li>Local LLM Ops</li>
          <li>YouTube Deep Dive Notes</li>
        </ul>
      </section>

      <section id="featured" className="featured">
        <div className="section-head">
          <h2>Featured Case Studies</h2>
          <Link href="/case" className="inline-link">
            <CompassIcon className="inline-link-icon" />
            전체 글 보기
          </Link>
        </div>
        <div className="cards spotlight-cards">
          {featuredPosts.map((post, index) => (
            <article key={post.title} className="card spotlight-card">
              <CaseThumbnail post={post} variant="card" />
              <span>{post.tag}</span>
              <h3>{`#${index + 1} ${post.title}`}</h3>
              <p>{post.summary}</p>
              <Link href={`/case/${post.slug}`} className="inline-link">
                케이스 읽기
                <ArrowRightIcon className="inline-link-icon" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="cta cta-editorial">
        <h2>영상 보고 왔다면, 여기서 바로 이어서 보세요</h2>
        <p>
          각 글 상단에 유튜브 원본 영상과 함께 실습 코드/설정값을 함께 정리할
          예정입니다.
        </p>
      </section>
    </main>
  );
}
