"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="detail-main empty-state"><h1 className="page-title">공연 정보를 불러오지 못했어요</h1><p>잠시 후 다시 시도해 주세요.</p><button onClick={reset} className="text-link">다시 불러오기</button></main>;
}
