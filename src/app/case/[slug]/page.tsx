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
    <main className="page">
      <nav className="top-nav">
        <Link href="/" scroll>
          홈으로
        </Link>
        <Link href="/case" scroll>
          사례 목록
        </Link>
      </nav>
      <article className="case-article">
        <p className="eyebrow">{post.tag}</p>
        <h1>{`${caseNumber ? `#${caseNumber} ` : ""}${post.title}`}</h1>
        <p className="lead">{post.summary}</p>
        <CaseThumbnail post={post} variant="detail" />

        <div className="meta-row">
          <span>{post.publishedAt}</span>
          {hasYoutubeVideo(post) && post.youtubeUrl ? (
            <a href={post.youtubeUrl} target="_blank" rel="noreferrer">
              연결 영상 보기
            </a>
          ) : (
            <span>영상 링크 준비 중</span>
          )}
        </div>

        <section className="content-block">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <div className="back-link">
          <Link href="/case">← 전체 사례로 돌아가기</Link>
        </div>
      </article>
    </main>
  );
}
