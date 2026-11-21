"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();
  const links = [
    { href: "/performances", label: "공연목록", active: path.startsWith("/performances") && !path.startsWith("/performances-new") },
    { href: "/performances-new", label: "신인연주자", active: path.startsWith("/performances-new") },
    { href: "/seats", label: "좌석선호도", active: path === "/seats" },
  ];
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-row">
          <Link href="/performances" className="brand">세상의 모든 피아노공연 알리미 <em>PPA</em></Link>
          <span className="brand-caption">당신의 다음 공연을 찾아보세요</span>
        </div>
        <nav className="main-nav" aria-label="주 메뉴">
          {links.map(link => <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined}>{link.label}</Link>)}
          <span className="nav-unavailable" title="준비 중">커뮤니티 <small>준비 중</small></span>
        </nav>
      </div>
    </header>
  );
}
