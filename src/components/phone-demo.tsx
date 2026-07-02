"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const WAVE_BARS = [18, 32, 24, 40, 28, 20, 36, 26, 42, 22, 34, 18];

const RADAR_DATA = [
  { subject: "발음", score: 85 },
  { subject: "억양", score: 74 },
  { subject: "유창성", score: 78 },
  { subject: "문법", score: 90 },
  { subject: "어휘", score: 82 },
];

const DETAIL_CARDS = [
  {
    icon: "🗣️",
    label: "발음",
    grade: "Good",
    tone: "emerald" as const,
    note: "일부 단어에서 강세 위치가 부정확해요",
  },
  {
    icon: "⏱️",
    label: "유창성",
    grade: "Fair",
    tone: "amber" as const,
    note: "답변 사이 침묵이 다소 길어요 (평균 1.8초)",
  },
];

const BADGE_STYLES = {
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

export function PhoneDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [screen, setScreen] = useState<"recording" | "feedback">("recording");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (screen !== "recording") return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [screen]);

  const handleTap = () => {
    setHasInteracted(true);
    setScreen((s) => (s === "recording" ? "feedback" : "recording"));
    setElapsed(0);
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-28 text-center sm:py-36"
    >
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        실제 시험처럼 녹음하고, <span className="text-orange-500">바로</span>{" "}
        피드백 받기
      </h2>
      <p className="max-w-md text-zinc-500">
        핸드폰 화면을 눌러서 녹음 화면과 채점 결과 화면을 직접 확인해보세요.
      </p>

      <div
        className={`mt-12 flex items-end justify-center transition-all duration-700 ease-out ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        <div className="relative z-10 hidden w-36 shrink-0 -translate-y-6 -scale-x-100 sm:block md:w-44 lg:w-52">
          <Image
            src="/mascots/rabbit.png"
            alt="토선생 토끼가 핸드폰을 가리키고 있어요"
            width={496}
            height={743}
            className="h-auto w-full drop-shadow-md"
          />
        </div>

        <div className="relative -ml-2 sm:-ml-4 md:-ml-6">
          {!hasInteracted && (
            <div className="absolute -top-9 left-1/2 z-20 -translate-x-1/2 animate-bounce rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium whitespace-nowrap text-white shadow-lg">
              👆 눌러보세요
            </div>
          )}

          {!hasInteracted && (
            <div className="absolute inset-0 -z-10 animate-ping rounded-[3rem] bg-orange-300/50" />
          )}

          <button
            type="button"
            onClick={handleTap}
            className="relative block w-64 cursor-pointer overflow-hidden rounded-[2.5rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl transition-transform outline-none active:scale-[0.98]"
          >
            <div className="absolute top-0 left-1/2 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-zinc-900" />

            <div className="aspect-[9/19] w-full overflow-hidden bg-white">
              {screen === "recording" ? (
                <div className="flex h-full flex-col items-center justify-between bg-gradient-to-b from-orange-50 to-white px-4 pt-10 pb-8">
                  <div className="text-left text-xs leading-relaxed text-zinc-500">
                    <span className="mb-1 block font-semibold text-zinc-700">
                      Q5
                    </span>
                    최근에 다녀온 여행지에 대해 설명하세요.
                  </div>

                  <div className="flex h-16 items-center gap-1">
                    {WAVE_BARS.map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 rounded-full bg-orange-400"
                        style={{
                          height: `${h}px`,
                          animation: "soundwave 1s ease-in-out infinite",
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                      <span className="size-2 animate-pulse rounded-full bg-red-500" />
                      녹음 중 {mm}:{ss}
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      화면을 눌러 답변 종료
                    </span>
                  </div>
                </div>
              ) : (
                <div className="no-scrollbar h-full space-y-5 overflow-y-auto bg-white px-5 py-7 text-center">
                  <div>
                    <span className="text-[11px] font-medium text-zinc-400">
                      토익 스피킹 예상 점수
                    </span>
                    <div className="mt-1 flex items-end justify-center gap-1">
                      <span className="text-5xl font-extrabold text-orange-500">
                        160
                      </span>
                      <span className="pb-1.5 text-sm text-zinc-400">
                        / 200
                      </span>
                    </div>
                    <span className="mt-1.5 inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-500">
                      Intermediate High
                    </span>

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500"
                        style={{ width: "80%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-left text-xs font-semibold text-zinc-700">
                      역량 분석
                    </h3>
                    <div className="mx-auto h-36 w-full max-w-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={RADAR_DATA} outerRadius="70%">
                          <PolarGrid stroke="#f0f0f0" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 9, fill: "#a1a1aa" }}
                          />
                          <PolarRadiusAxis
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                          />
                          <Radar
                            dataKey="score"
                            stroke="#f97316"
                            fill="#f97316"
                            fillOpacity={0.35}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-left text-xs font-semibold text-zinc-700">
                      상세 피드백
                    </h3>
                    {DETAIL_CARDS.map(({ icon, label, grade, tone, note }) => (
                      <div
                        key={label}
                        className="rounded-2xl bg-zinc-50 p-3 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                            <span>{icon}</span>
                            {label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE_STYLES[tone]}`}
                          >
                            {grade}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500">
                          {note}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border-l-4 border-orange-400 bg-orange-50/60 p-3 text-left">
                    <span className="text-[10px] font-semibold text-orange-500">
                      총평
                    </span>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                      논리적 구성은 훌륭해요! 발음 강세만 조금 더 연습하면
                      다음엔 더 높은 점수를 받을 수 있어요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
