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

const PART_RADAR_DATA = [
  { part: "Part 1", percent: 83 },
  { part: "Part 2", percent: 67 },
  { part: "Part 3", percent: 78 },
  { part: "Part 4", percent: 89 },
  { part: "Part 5", percent: 80 },
];

const STRENGTHS = ["답변 구조가 논리적이고 명확해요", "핵심 어휘 사용이 적절해요"];

const WEAKNESSES = ["일부 단어에서 강세 위치가 부정확해요", "답변 사이 침묵이 다소 길어요"];

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
      id="service-intro"
      ref={sectionRef}
      className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-28 text-center sm:py-36 xl:max-w-7xl 2xl:max-w-[100rem]"
    >
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
        실제 시험처럼 녹음하고, <span className="text-orange-500">바로</span>{" "}
        피드백 받기
      </h2>
      <p className="max-w-lg text-zinc-500 sm:text-lg lg:text-xl">
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
                    <span className="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-600">
                      예상 총점
                    </span>
                    <div className="mt-1.5 flex items-end justify-center gap-1">
                      <span className="text-5xl font-extrabold text-orange-600">
                        160
                      </span>
                      <span className="pb-1.5 text-sm text-zinc-400">
                        / 200
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-blue-950">
                      Intermediate High
                    </p>

                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: "80%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-left text-xs font-bold text-blue-950">
                      파트별 점수
                    </h3>
                    <div className="mx-auto h-36 w-full max-w-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={PART_RADAR_DATA} outerRadius="70%">
                          <PolarGrid stroke="#f0f0f0" />
                          <PolarAngleAxis
                            dataKey="part"
                            tick={{ fontSize: 9, fill: "#71717a" }}
                          />
                          <PolarRadiusAxis
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                          />
                          <Radar
                            dataKey="percent"
                            stroke="#f97316"
                            fill="#f97316"
                            fillOpacity={0.35}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-3 text-left">
                    <p className="text-[10px] font-bold text-emerald-600">
                      강점
                    </p>
                    <ul className="mt-1 space-y-1">
                      {STRENGTHS.map((item) => (
                        <li
                          key={item}
                          className="flex gap-1.5 text-[10px] leading-relaxed text-zinc-600"
                        >
                          <span className="text-emerald-500">+</span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-2.5 text-[10px] font-bold text-rose-600">
                      약점
                    </p>
                    <ul className="mt-1 space-y-1">
                      {WEAKNESSES.map((item) => (
                        <li
                          key={item}
                          className="flex gap-1.5 text-[10px] leading-relaxed text-zinc-600"
                        >
                          <span className="text-rose-500">−</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border-l-4 border-orange-400 bg-orange-50/60 p-3 text-left">
                    <span className="text-[10px] font-semibold text-orange-600">
                      종합 피드백
                    </span>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                      논리적 구성은 훌륭해요! 발음 강세만 조금 더 연습하면
                      다음엔 더 높은 점수를 받을 수 있어요.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-300 p-3">
                    <p className="text-center text-xs font-extrabold text-white">
                      파트별 피드백
                    </p>
                    <div className="relative mt-3 rounded-xl bg-white p-3 text-left">
                      <div className="absolute -top-4 right-2 size-9">
                        <Image
                          src="/mascots/mike.png"
                          alt="마이크를 든 앵무새 캐릭터"
                          fill
                          sizes="36px"
                          className="object-contain drop-shadow-sm"
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-orange-600">
                        Part 3
                      </span>
                      <p className="mt-1 rounded-lg bg-sky-50 p-2 text-[10px] leading-relaxed text-sky-900 ring-1 ring-sky-100">
                        질문 의도 파악은 좋았지만, 답변 길이가 조금 짧아요.
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-semibold text-white">
                          Q5
                        </span>
                        <span className="inline-flex items-center rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-semibold text-white">
                          Q6
                        </span>
                      </div>
                    </div>
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
