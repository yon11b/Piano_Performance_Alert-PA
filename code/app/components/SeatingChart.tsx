"use client";
import { useEffect, useState } from "react";

type Seat = { id: string; x: number; y: number; rotation: number; label: string };
const STORAGE_KEY = "ppa-seat-preferences-v1";

// Preserve the previous source's fan-shaped A-E sections and rear chorus layout.
function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 24; col++) seats.push({ id: `Chorus-M-${row}-${col}`, x: 285 + col * 10, y: 50 + row * 14, rotation: 0, label: `합창석 중앙 ${row + 1}열 ${col + 1}번` });
    for (let col = 0; col < 8; col++) {
      seats.push({ id: `Chorus-L-${row}-${col}`, x: 200 + col * 10 - row * 5, y: 60 + row * 15, rotation: -20, label: `합창석 왼쪽 ${row + 1}열 ${col + 1}번` });
      seats.push({ id: `Chorus-R-${row}-${col}`, x: 530 + col * 10 + row * 5, y: 60 + row * 15, rotation: 20, label: `합창석 오른쪽 ${row + 1}열 ${col + 1}번` });
    }
  }
  const sections = [ { name: "A", start: 125, end: 145, rows: 20 }, { name: "B", start: 105, end: 125, rows: 20 }, { name: "C", start: 80, end: 100, rows: 22 }, { name: "D", start: 55, end: 75, rows: 20 }, { name: "E", start: 35, end: 55, rows: 20 } ];
  for (const section of sections) for (let row = 0; row < section.rows; row++) {
    const count = section.name === "C" ? 12 : 8;
    for (let col = 0; col < count; col++) {
      const angle = section.start + col * (section.end - section.start) / (count - 1);
      const radius = 380 + row * 18;
      seats.push({ id: `${section.name}-${row}-${col}`, x: 400 + radius * Math.cos(angle * Math.PI / 180), y: -50 + radius * Math.sin(angle * Math.PI / 180), rotation: angle + 90, label: `${section.name}구역 ${row + 1}열 ${col + 1}번` });
    }
  }
  return seats;
}
const seats = generateSeats();
const seatIds = new Set(seats.map(seat => seat.id));

export default function SeatingChart() {
  const [selected, setSelected] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (Array.isArray(value)) setSelected(value.filter((id): id is string => typeof id === "string" && seatIds.has(id)));
      } catch { /* Unavailable storage does not prevent using the chart. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  function toggle(id: string) { setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); setStatus(""); }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); setStatus("이 브라우저에 좌석 선호도를 저장했어요."); }
    catch { setStatus("브라우저 저장소를 사용할 수 없습니다."); }
  }
  return <>
    <div className="seat-tools">
      <button onClick={() => setZoom(value => Math.max(.75, value - .25))} aria-label="축소">−</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(value => Math.min(3, value + .25))} aria-label="확대">＋</button>
      <button onClick={() => { setSelected([]); setStatus(""); }}>선택 초기화</button>
      <button onClick={save}>선호 좌석 저장</button>
      <span>빨간색: 선택한 좌석</span>
    </div>
    <div className="seat-viewport" aria-label="확대 후 스크롤하여 좌석을 찾아보세요">
      <svg width={`${100 * zoom}%`} style={{ minWidth: 650 * zoom, display: "block" }} viewBox="-240 0 1280 850" aria-label="참고용 콘서트홀 좌석 배치도">
        <rect x="280" y="145" width="240" height="80" rx="5" fill="#d9d5d4" stroke="#999" />
        <text x="400" y="191" textAnchor="middle" fontSize="18" fill="#433634">STAGE</text>
        <text x="400" y="295" textAnchor="middle" fontSize="24" fill="#6b5c57">1F</text>
        {seats.map(seat => <g key={seat.id} transform={`translate(${seat.x} ${seat.y}) rotate(${seat.rotation})`}>
          <rect width="10" height="10" rx="2" fill={selected.includes(seat.id) ? "#e33445" : "#fff"} stroke="#7b7371" strokeWidth=".7" role="checkbox" aria-checked={selected.includes(seat.id)} aria-label={seat.label} tabIndex={0} onClick={() => toggle(seat.id)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(seat.id); } }} style={{ cursor: "pointer" }}><title>{seat.label}</title></rect>
        </g>)}
      </svg>
    </div>
    <div className="selected-seats"><strong>선호 좌석 {selected.length}개</strong><div>{selected.map(id => <button key={id} onClick={() => toggle(id)} aria-label={`${seats.find(seat => seat.id === id)?.label} 선택 해제`}>{seats.find(seat => seat.id === id)?.label} ×</button>)}</div></div>
    <p className="seat-status" role="status">{status}</p>
  </>;
}
