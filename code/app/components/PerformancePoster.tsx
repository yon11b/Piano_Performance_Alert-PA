"use client";
import { useState } from "react";

export default function PerformancePoster({ src, title }: { src: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  const image = src?.replace(/^http:\/\/(?:www\.)?kopis\.or\.kr\//, "https://kopis.or.kr/");
  if (!image || !/^https?:\/\//i.test(image) || failed) {
    return <div className="poster-placeholder"><span aria-hidden="true">♫</span><span>포스터 준비 중</span></div>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image} alt={`${title} 포스터`} className="performance-poster" loading="lazy" onError={() => setFailed(true)} />;
}
