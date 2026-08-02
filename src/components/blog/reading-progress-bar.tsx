"use client";

import { useEffect, useState } from "react";

/** 문서 스크롤 진행률을 상단에 얇은 바로 표시한다. 장식이므로 aria-hidden. */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[3px] bg-orange-200/50"
    >
      <div className="h-full bg-orange-600" style={{ width: `${progress}%` }} />
    </div>
  );
}
