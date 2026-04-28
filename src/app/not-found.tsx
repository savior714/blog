import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="page magazine-page">
      <section className="not-found">
        <p className="eyebrow">404</p>
        <h1>Signal Lost: 페이지를 찾을 수 없습니다.</h1>
        <p className="lead">
          잘못된 링크이거나 이동된 페이지입니다. 아래 버튼으로 메인으로 돌아가세요.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/" scroll>
            메인으로 이동
          </Link>
          <Link className="button ghost" href="/case" scroll>
            사례 목록 보기
            <ArrowRightIcon className="button-icon" />
          </Link>
        </div>
      </section>
    </main>
  );
}
