"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function RabbitMascot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blinkTrigger, setBlinkTrigger] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBlinkTrigger((prev) => prev + 1);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto h-64 w-64">
      <Image
        src="/mascots/rabbit/base.png"
        alt="토끼 캐릭터"
        fill
        sizes="256px"
        className="object-contain"
        priority
      />
      <Image
        key={blinkTrigger}
        src="/mascots/rabbit/eyes.png"
        alt=""
        fill
        sizes="256px"
        className="animate-[blink-once_0.5s_ease-in-out] object-contain"
        style={{ transformOrigin: "50% 45.8%" }}
        aria-hidden
      />
    </div>
  );
}
