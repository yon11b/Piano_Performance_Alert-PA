import { notFound } from "next/navigation";
import PerformanceCard, { type PerformanceType } from "@/app/components/PerformanceCard";
import db from "@/lib";
import Link from "next/link";

export default async function PerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const performance = await db.Performance.findOne({
    where: { id, save: 1 },
  });

  if (!performance) notFound();

  const item = performance.get({ plain: true }) as PerformanceType;
  return <main className="detail-main">
    <Link href="/performances" className="back-link text-link">← 공연 목록으로</Link>
    <PerformanceCard performance={item} />
    <section className="detail-panel">
      <h2>공연 안내</h2>
      <dl className="performance-facts">
        <dt>장소</dt><dd>{item.location || "정보 없음"}</dd>
        <dt>장르</dt><dd>{item.genre || "정보 없음"}</dd>
        <dt>시간</dt><dd>{item.runtime || "정보 없음"}</dd>
        <dt>연령</dt><dd>{item.age || "정보 없음"}</dd>
      </dl>
    </section>
    {(item.program || item.composer) && <section className="detail-panel"><h2>프로그램</h2><p>{item.composer}</p><p>{item.program}</p></section>}
    <section className="detail-panel"><h2>공연 소개</h2><p>{item.story || "등록된 공연 소개가 없습니다."}</p></section>
  </main>;
}
