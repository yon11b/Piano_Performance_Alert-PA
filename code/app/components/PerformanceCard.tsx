import Link from "next/link";
import PerformancePoster from "./PerformancePoster";
import type { PerformanceType } from "@/lib/performance-types";
export type { PerformanceType } from "@/lib/performance-types";

export default function PerformanceCard({ performance: p }: { performance: PerformanceType }) {
  return (
    <article className="performance-card">
      <Link href={`/performances/${encodeURIComponent(p.id)}`} className="poster-link" aria-label={`${p.title} 상세보기`}>
        <PerformancePoster src={p.poster} title={p.title} />
      </Link>
      <div className="card-content">
        <h2><Link href={`/performances/${encodeURIComponent(p.id)}`}>{p.title}</Link></h2>
        <dl className="performance-facts">
          <dt>일자</dt><dd>{p.date_start || "일정 미정"}{p.date_finish && p.date_finish !== p.date_start ? ` ~ ${p.date_finish}` : ""}</dd>
          <dt>시간</dt><dd>{p.time || "시간 정보 없음"}</dd>
          <dt>가격</dt><dd>{p.price || "가격 정보 없음"}</dd>
          <dt>출연</dt><dd className="cast-text">{p.cast || "출연진 정보 없음"}</dd>
        </dl>
        <p className="card-location">{p.location || "장소 정보 없음"}</p>
      </div>
    </article>
  );
}
