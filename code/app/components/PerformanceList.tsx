import Link from "next/link";
import PerformanceCard from "./PerformanceCard";
import type { PerformanceType } from "@/lib/performance-types";

const levels = [{ value: "WORLD", label: "WORLD STAR" }, { value: "NATIONAL", label: "NATIONAL STAR" }, { value: "RISING", label: "RISING STAR" }];
const composers = ["쇼팽", "라흐마니노프", "쇼스타코비치", "드보르자크", "라벨", "베토벤", "드뷔시", "바그너", "슈만", "바흐", "리스트", "차이콥스키", "브람스", "하이든", "모차르트", "헨델"];

export default function PerformanceList({ performances, total, page, pages, search = "", famous = "", composer = "", newbee = false }: {
  performances: PerformanceType[]; total: number; page: number; pages: number; search?: string; famous?: string; composer?: string; newbee?: boolean;
}) {
  const base = newbee ? "/performances-new" : "/performances";
  function url(changes: Record<string, string>) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (famous && !newbee) params.set("famous", famous);
    if (composer) params.set("composer", composer);
    for (const [key, value] of Object.entries(changes)) { if (value) params.set(key, value); else params.delete(key); }
    return `${base}?${params}`;
  }
  return (
    <main className="performance-main">
      {newbee ? <>
        <h1 className="page-title">신인 연주자 공연</h1>
        <div className="composer-tabs" aria-label="작곡가 선택">
          {["전체", ...composers].map(name => <Link key={name} href={url({ composer: name === "전체" ? "" : name })} className={composer === name || (!composer && name === "전체") ? "selected" : ""}>{name}</Link>)}
        </div>
      </> : <>
        <h1 className="sr-only">공연 목록</h1>
        <div className="star-tabs" aria-label="연주자 등급 선택">
          {levels.map(level => <Link key={level.value} href={url({ famous: level.value })} className={`star-tab ${level.value.toLowerCase()} ${famous === level.value ? "selected" : ""}`} aria-current={famous === level.value ? "page" : undefined}>{level.label}</Link>)}
        </div>
      </>}
      <div className="list-toolbar">
        <div className="list-summary">
          {!newbee && <Link href={url({ famous: "" })} className={!famous ? "all-filter selected" : "all-filter"}>전체 공연</Link>}
          <span>총 <strong>{total.toLocaleString()}</strong>개 공연</span>
        </div>
        <form action={base} className="search-form">
          {famous && !newbee && <input type="hidden" name="famous" value={famous} />}
          {composer && <input type="hidden" name="composer" value={composer} />}
          <label htmlFor="performance-search" className="sr-only">공연 검색</label>
          <input id="performance-search" name="search" defaultValue={search} placeholder="공연명, 연주자, 곡목 검색" />
          <button type="submit">검색</button>
        </form>
      </div>
      {performances.length ? newbee ? <div className="table-scroll"><table className="performance-table">
        <thead><tr><th>번호</th><th>제목</th><th>일시</th><th>장소</th><th>가격</th><th>작곡가</th></tr></thead>
        <tbody>{performances.map((p, index) => <tr key={p.id}><td>{(page - 1) * 100 + index + 1}</td><td><Link href={`/performances/${encodeURIComponent(p.id)}`}>{p.title}</Link></td><td>{p.date_start || "미정"}</td><td>{p.location || "미정"}</td><td>{p.price || "정보 없음"}</td><td>{p.composer || "정보 없음"}</td></tr>)}</tbody>
      </table></div> : <div className="performance-grid">{performances.map(p => <PerformanceCard key={p.id} performance={p} />)}</div> : <div className="empty-state">
        <h2>{search || composer ? "검색 결과가 없습니다" : famous || newbee ? "이 등급에 등록된 공연이 없습니다" : "아직 등록된 공연이 없습니다"}</h2>
        <p>{famous || newbee ? "전체 목록에서 다른 공연을 찾아보세요." : "수집이 진행 중이라면 잠시 후 새로고침해 주세요."}</p>
        <Link href="/performances" className="text-link">전체 공연 보기 →</Link>
      </div>}
      {pages > 1 && <nav className="pagination" aria-label="페이지 이동">
        {page > 1 && <Link href={url({ page: String(page - 1) })}>← 이전</Link>}
        <span>{page} / {pages}</span>
        {page < pages && <Link href={url({ page: String(page + 1) })}>다음 →</Link>}
      </nav>}
    </main>
  );
}
