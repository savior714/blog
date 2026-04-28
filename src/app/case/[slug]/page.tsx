import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  casePosts,
  getCaseBySlug,
  getCaseNumberBySlug,
  hasYoutubeVideo,
} from "@/lib/cases";
import { CaseThumbnail } from "@/components/case-thumbnail";
import { ArrowRightIcon, HomeIcon, PlayIcon } from "@/components/ui/icons";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return casePosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getCaseBySlug(slug);
  const caseNumber = getCaseNumberBySlug(slug);

  if (!post) {
    return { title: "Case Not Found" };
  }

  return {
    title: `${caseNumber ? `#${caseNumber} ` : ""}${post.title} | Savior Lab Notes`,
    description: post.summary,
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getCaseBySlug(slug);
  const caseNumber = getCaseNumberBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="page magazine-page">
      <nav className="top-nav">
        <Link href="/" scroll className="inline-link">
          <HomeIcon className="inline-link-icon" />
          홈으로
        </Link>
        <Link href="/case" scroll className="inline-link">
          사례 목록
        </Link>
      </nav>
      <article className="case-article editorial-article">
        <header className="article-hero">
          <p className="eyebrow">{post.tag}</p>
          <h1>{`${caseNumber ? `#${caseNumber} ` : ""}${post.title}`}</h1>
          <p className="lead">{post.summary}</p>
          <CaseThumbnail post={post} variant="detail" />
        </header>

        <div className="meta-row">
          <span>{post.publishedAt}</span>
          {hasYoutubeVideo(post) && post.youtubeUrl ? (
            <a href={post.youtubeUrl} target="_blank" rel="noreferrer" className="inline-link">
              <PlayIcon className="inline-link-icon" />
              연결 영상 보기
            </a>
          ) : (
            <span>영상 링크 준비 중</span>
          )}
        </div>

        <section className="content-block editorial-content">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <div className="back-link">
          <Link href="/case" className="inline-link">
            <ArrowRightIcon className="inline-link-icon back" />
            전체 사례로 돌아가기
          </Link>
        </div>
      </article>
    </main>
  );
}
