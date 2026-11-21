import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "PPA | 세상의 모든 피아노공연 알리미",
  description: "공연과 연주자를 만나고 나에게 맞는 좌석을 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
