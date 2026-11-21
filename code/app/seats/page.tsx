import SeatingChart from "@/app/components/SeatingChart";
export default function SeatsPage() {
  return <main className="performance-main">
    <h1 className="page-title">좌석 선호도</h1>
    <p>예술의전당 콘서트홀 · 1층</p>
    <p className="seat-note">참고용 배치도이며 실제 좌석·예매 현황과 다를 수 있습니다. 선택한 좌석은 이 브라우저에 저장됩니다.</p>
    <section className="seat-panel"><SeatingChart /></section>
  </main>;
}
