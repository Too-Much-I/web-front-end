"use client";

import { ChevronRight, ThumbsUp, TriangleAlert } from "lucide-react";
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

import { SketchyDashBorder } from "@/components/exam/sketchy-dash-border";
import { jua } from "@/lib/fonts";
import { useCountUp } from "@/lib/use-count-up";

const WAVE_BARS = [18, 32, 24, 40, 28, 20, 36, 26, 42, 22, 34, 18];

const PART_RADAR_DATA = [
  { part: "Part 1", percent: 83 },
  { part: "Part 2", percent: 67 },
  { part: "Part 3", percent: 78 },
  { part: "Part 4", percent: 89 },
  { part: "Part 5", percent: 80 },
];

const STRENGTHS = [
  "답변 구조가 논리적이고 명확해요",
  "핵심 어휘 사용이 적절해요",
];

const WEAKNESSES = [
  "일부 단어에서 강세 위치가 부정확해요",
  "답변 사이 침묵이 다소 길어요",
];

const TOTAL_SCORE = 160;
const MAX_SCORE = 200;

/** 자동 재생 시 각 화면을 보여주는 시간(ms). 피드백 화면은 볼 게 많아 더 길게 둔다. */
const AUTOPLAY_RECORDING_MS = 3500;
const AUTOPLAY_FEEDBACK_MS = 6500;

/** 피드백 화면 블록들의 순차 등장 애니메이션. i가 커질수록 늦게 나타난다. */
function fadeUp(i: number) {
  return {
    animation: "demo-fade-up 0.45s ease-out both",
    animationDelay: `${i * 0.12}s`,
  };
}

export function PhoneDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [screen, setScreen] = useState<"recording" | "feedback">("recording");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // 피드백 화면에 들어올 때마다 0 → 총점 카운트업.
  const displayScore = useCountUp(TOTAL_SCORE, {
    enabled: screen === "feedback",
  });

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

  // 스크롤만 하고 지나가는 방문자도 채점 리포트 화면을 보도록, 탭하기 전까지는
  // 녹음 ↔ 피드백 화면을 자동으로 오간다. 한 번이라도 탭하면 수동 조작으로 전환.
  useEffect(() => {
    if (!revealed || hasInteracted) return;
    const id = setTimeout(
      () => {
        setScreen((s) => (s === "recording" ? "feedback" : "recording"));
        setElapsed(0);
      },
      screen === "recording" ? AUTOPLAY_RECORDING_MS : AUTOPLAY_FEEDBACK_MS,
    );
    return () => clearTimeout(id);
  }, [revealed, hasInteracted, screen]);

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
        모의고사가 끝나면 이런 채점 리포트를 바로 받아요. 화면을 눌러 직접
        넘겨볼 수도 있어요.
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
                <div className="no-scrollbar h-full space-y-4 overflow-y-auto bg-white px-4 py-6 text-left">
                  <div style={fadeUp(0)}>
                    <p className="text-[8px] font-semibold tracking-wide text-orange-600">
                      SESSION ANALYSIS
                    </p>
                    <p className="text-sm font-bold text-blue-950">
                      채점 결과 리포트
                    </p>
                  </div>

                  <div
                    className="rounded-2xl border-4 border-amber-900 bg-emerald-950 p-3 shadow-md"
                    style={fadeUp(1)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-amber-300">★</span>
                      <span
                        className={`${jua.className} text-xs text-amber-100`}
                      >
                        예상 총점
                      </span>
                    </div>
                    <p
                      className={`${jua.className} mt-1.5 text-3xl text-amber-50`}
                    >
                      {displayScore}
                      <span className="text-sm text-white/50">
                        {" "}
                        / {MAX_SCORE}
                      </span>
                    </p>
                    <p
                      className={`${jua.className} mt-0.5 text-[10px] text-amber-200`}
                    >
                      Intermediate High
                    </p>
                    <div className="mt-2 h-1 w-full rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-amber-300"
                        style={{
                          width: `${(displayScore / MAX_SCORE) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-1">
                      <span className="text-[10px] text-amber-300">★</span>
                      <span
                        className={`${jua.className} text-xs text-amber-100`}
                      >
                        파트별 세부 점수
                      </span>
                    </div>
                    <div className="mx-auto h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={PART_RADAR_DATA} outerRadius="66%">
                          <PolarGrid stroke="rgba(255,255,255,0.15)" />
                          <PolarAngleAxis
                            dataKey="part"
                            tick={{ fontSize: 8, fill: "#e4e4e7" }}
                          />
                          <PolarRadiusAxis
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                          />
                          <Radar
                            dataKey="percent"
                            stroke="#fcd34d"
                            fill="#fcd34d"
                            fillOpacity={0.35}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div
                    className="relative rounded-2xl bg-white p-3"
                    style={fadeUp(2)}
                  >
                    <SketchyDashBorder radius={16} />
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-950">
                      <ThumbsUp
                        className="size-3 text-orange-500"
                        aria-hidden
                      />
                      강점
                    </span>
                    <ul className="mt-1.5 space-y-1">
                      {STRENGTHS.map((item) => (
                        <li
                          key={item}
                          className="rounded-lg bg-zinc-50 p-1.5 text-[10px] leading-relaxed text-zinc-700 ring-1 ring-zinc-100"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="relative rounded-2xl bg-white p-3"
                    style={fadeUp(3)}
                  >
                    <SketchyDashBorder radius={16} />
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-950">
                      <TriangleAlert
                        className="size-3 text-orange-500"
                        aria-hidden
                      />
                      보완 필요
                    </span>
                    <ul className="mt-1.5 space-y-1">
                      {WEAKNESSES.map((item) => (
                        <li
                          key={item}
                          className="rounded-lg bg-zinc-50 p-1.5 text-[10px] leading-relaxed text-zinc-700 ring-1 ring-zinc-100"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="relative rounded-2xl bg-white p-3"
                    style={fadeUp(4)}
                  >
                    <SketchyDashBorder radius={16} />
                    <span className="text-[10px] font-bold text-blue-950">
                      종합 피드백
                    </span>
                    <p className="mt-1 text-[10px] leading-relaxed text-zinc-700">
                      논리적 구성은 훌륭해요! 발음 강세만 조금 더 연습하면
                      다음엔 더 높은 점수를 받을 수 있어요.
                    </p>
                  </div>

                  <div
                    className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-300 p-2.5"
                    style={fadeUp(5)}
                  >
                    <p className="text-center text-xs font-extrabold text-white">
                      파트별 피드백
                    </p>
                    <div className="relative mt-3 pt-4">
                      <div className="absolute top-0 left-0 z-10 rounded-t-lg bg-white px-2 py-1">
                        <span className="text-[9px] font-extrabold text-orange-600">
                          Part 3
                        </span>
                      </div>
                      <div className="absolute -top-2 right-1.5 z-10 size-9">
                        <Image
                          src="/mascots/mike.png"
                          alt="마이크를 든 앵무새 캐릭터"
                          fill
                          sizes="36px"
                          className="object-contain drop-shadow-sm"
                        />
                      </div>
                      <div className="rounded-xl rounded-tl-none bg-white p-2.5 text-left shadow-sm">
                        <p className="rounded-lg bg-sky-50 p-1.5 text-[10px] leading-relaxed text-sky-900 ring-1 ring-sky-100">
                          질문 의도 파악은 좋았지만, 답변 길이가 조금 짧아요.
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          <span className="text-[9px] font-semibold text-sky-700">
                            문제별 피드백 보기
                          </span>
                          {["Q5", "Q6"].map((q) => (
                            <span
                              key={q}
                              className="inline-flex items-center gap-0.5 rounded-full bg-sky-500 py-0.5 pr-1 pl-2 text-[9px] font-semibold text-white"
                            >
                              {q}
                              <span className="flex size-3 items-center justify-center rounded-full bg-white/25">
                                <ChevronRight
                                  className="size-2.5"
                                  aria-hidden
                                />
                              </span>
                            </span>
                          ))}
                        </div>
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
