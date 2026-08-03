"use client";

import Image from "next/image";
import { useState } from "react";

import { feedbackMascots } from "@/components/app-exam-screen/assets";
import { feedbackColors } from "@/components/app-exam-screen/theme";
import { MetricDeltaList } from "@/components/app-question-feedback/components/MetricDeltaList";
import { RetryScoreChart } from "@/components/app-question-feedback/components/RetryScoreChart";
import { SingleAttemptScoreRing } from "@/components/app-question-feedback/components/SingleAttemptScoreRing";
import {
  buildMetricGroups,
  deltaTone,
  formatDelta,
  formatScore,
  getRetryScores,
  indexOfRetryCount,
} from "@/components/app-question-feedback/retry-view-model";
import { TypedText } from "@/components/exam/typed-text";
import type { ExamQuestionDetail } from "@/types/exam";

const DELTA_COLOR = {
  up: feedbackColors.radarFill,
  down: "#FDA4AF",
  same: "rgb(255 255 255 / 60%)",
} as const;

/** 손글씨로 쓱 그은 듯한 화살표 — 눌러 볼 곳으로 시선을 끈다. */
function HintArrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 32"
      width={34}
      height={23}
      fill="none"
      className="shrink-0 translate-x-1 -translate-y-1"
      style={{ color: feedbackColors.radarFill }}
    >
      <path
        d="M44 26 C 30 28, 16 20, 8 12"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M16 17 L8 12 L15 7"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 나무 프레임 칠판. 두 상태를 오간다.
 *  - 기본: 회차별 총점 그래프 + 지금 회차 점수
 *  - 점수를 누르면: 첫 회차 대비 지표 증감
 *
 * 그래프의 점을 누르면 그 회차의 피드백으로 바뀐다(웹 화면의 좌우 "날개 버튼"을 대체).
 *
 * 전환은 칠판 아무 데나 눌러도 되게 했다. 다만 칠판 전체를 <button>으로 감싸면 안에 있는
 * 점(회차 이동)이 버튼 안의 버튼이 되므로, 바깥은 onClick만 가진 div로 두고 실제 버튼은
 * 안쪽에 그대로 남겼다 — 키보드·스크린리더는 그 버튼을 쓰고, 포인터는 칠판 아무 데나
 * 누르면 된다. 안쪽 버튼과 점은 stopPropagation으로 바깥 토글이 겹쳐 도는 걸 막는다.
 */
export function RetryScoreBoard({
  detail,
  onSelectRetry,
}: {
  detail: ExamQuestionDetail;
  onSelectRetry: (retryCount: number) => void;
}) {
  const [showMetrics, setShowMetrics] = useState(false);

  const scores = getRetryScores(detail);
  const activeIndex = Math.max(0, indexOfRetryCount(scores, detail.retryCount));
  const current = scores[activeIndex]?.score ?? detail.score;
  const first = scores[0]?.score ?? detail.score;
  const delta = current - first;
  const isFirstAttempt = activeIndex === 0;
  // totalRetryCount는 최초 응시를 포함하므로 1이면 아직 재도전하지 않은 상태다.
  const isSingleAttempt = detail.totalRetryCount === 1;
  const tone = deltaTone(delta);
  const hasVisibleLaterScores = activeIndex < scores.length - 1;
  // 예전 응답처럼 retryScores가 없는 경우에도 다음 회차 이동 안내는 유지한다.
  const hasUnlistedLaterAttempts =
    !hasVisibleLaterScores && detail.retryCount < detail.totalRetryCount - 1;

  const scorePercent =
    detail.maxScore > 0 ? (current / detail.maxScore) * 100 : 0;
  const mascot =
    scorePercent > 50 ? feedbackMascots.scoreGood : feedbackMascots.scoreHmm;

  const metricGroups = buildMetricGroups(detail, detail.retryCount);

  const hintLines = showMetrics
    ? isFirstAttempt
      ? ["첫 답변이라 비교할 회차가 없어요", "지금은 지표별 달성률이에요"]
      : ["만점 대비 %p 변화", "다시 누르면 회차별 총점으로"]
    : hasVisibleLaterScores
      ? ["점선은 이후 회차", "점을 누르면 해당 회차 피드백"]
      : hasUnlistedLaterAttempts
        ? [
            "위 회차 버튼으로 다음 회차를 볼 수 있어요",
            "칠판을 누르면 지표별 증감",
          ]
        : isSingleAttempt
          ? [
              "다시 답변하면 회차별 변화도 볼 수 있어요",
              "칠판을 누르면 지표별 증감",
            ]
          : ["점을 누르면 그 회차 피드백", "칠판을 누르면 지표별 증감"];

  function toggle() {
    setShowMetrics((shown) => !shown);
  }

  return (
    <section
      aria-label={isSingleAttempt ? "첫 답변 점수" : "회차별 점수"}
      className="relative mt-6 mb-12"
    >
      <div
        className="relative rounded-3xl p-2"
        style={{ backgroundColor: feedbackColors.wood }}
      >
        {/* role/tabIndex를 일부러 붙이지 않았다 — 안쪽에 같은 동작의 실제 버튼이 있어
            키보드·스크린리더 경로는 이미 있고, 여기에 또 달면 접근성 트리에 같은 컨트롤이
            두 번 잡힌다. 이 onClick은 포인터 사용자를 위한 넓은 터치 영역일 뿐이다. */}
        <div
          onClick={toggle}
          className="cursor-pointer rounded-2xl border-2 px-4 pt-7 pb-5"
          style={{
            borderColor: feedbackColors.woodLight,
            backgroundColor: feedbackColors.chalkboard,
          }}
        >
          <span
            className="absolute top-0 left-5 -translate-y-1/2 -rotate-3 rounded-lg px-3.5 py-1.5 text-sm shadow-md"
            style={{
              backgroundColor: feedbackColors.radarFill,
              color: feedbackColors.chalkboard,
            }}
          >
            {showMetrics
              ? isFirstAttempt
                ? "지표 점수"
                : "첫 답변 대비"
              : isSingleAttempt
                ? "첫 답변 점수"
                : "회차별 점수"}
          </span>

          {showMetrics ? (
            <button
              type="button"
              aria-pressed
              aria-label="회차별 총점으로 보기"
              onClick={(event) => {
                event.stopPropagation();
                toggle();
              }}
              className="w-full cursor-pointer"
            >
              <MetricDeltaList groups={metricGroups} />
            </button>
          ) : (
            <>
              <button
                type="button"
                aria-pressed={false}
                aria-label="지표별 증감 보기"
                onClick={(event) => {
                  event.stopPropagation();
                  toggle();
                }}
                className="w-full cursor-pointer py-1"
              >
                <span className="flex flex-wrap items-baseline justify-center gap-2">
                  <span className="text-5xl leading-none text-white tabular-nums">
                    {formatScore(current)}
                  </span>
                  <span
                    className="text-base"
                    style={{ color: feedbackColors.chalkMuted }}
                  >
                    / {formatScore(detail.maxScore)}
                  </span>
                  {!isFirstAttempt && (
                    <span
                      className="self-center text-sm"
                      style={{ color: DELTA_COLOR[tone] }}
                    >
                      ★{" "}
                      {tone === "same"
                        ? "첫 답변과 같은 점수"
                        : `첫 답변보다 ${formatDelta(delta)}점`}
                    </span>
                  )}
                </span>
                {!isSingleAttempt && (
                  <span
                    className="mt-1.5 block text-center text-[13px]"
                    style={{ color: "rgb(255 255 255 / 55%)" }}
                  >
                    {isFirstAttempt
                      ? "1차 · 첫 답변"
                      : `${detail.retryCount + 1}차 시도`}
                  </span>
                )}
              </button>

              <div className="mt-2.5">
                {isSingleAttempt ? (
                  <SingleAttemptScoreRing
                    score={current}
                    maxScore={detail.maxScore}
                  />
                ) : (
                  <RetryScoreChart
                    scores={scores}
                    maxScore={detail.maxScore}
                    activeIndex={activeIndex}
                    onSelect={(index) =>
                      onSelectRetry(scores[index].retryCount)
                    }
                  />
                )}
              </div>
            </>
          )}

          <p
            className="mt-3 flex items-center justify-center gap-1 text-center text-[13px] leading-tight"
            style={{ color: feedbackColors.chalkMuted }}
          >
            <HintArrow />
            <span>
              {hintLines[0]}
              <br />
              {hintLines[1]}
            </span>
          </p>

          <div className="mt-4 flow-root">
            {/* 칠판 왼쪽 아래로 올라오는 토끼 머리와 요약 문구가 겹치지 않도록
                실제 머리 크기만큼 텍스트가 피해 가는 투명 공간을 둔다. */}
            <span aria-hidden className="float-left h-14 w-12" />
            <TypedText
              text={detail.feedback.summary}
              className="text-center text-base leading-7 text-white/90"
            />
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none relative h-0">
        <Image
          alt=""
          src={mascot}
          width={256}
          height={256}
          className="absolute -bottom-4 -left-2 h-24 w-16 max-w-none -scale-x-100 object-contain drop-shadow-lg"
        />
      </div>
    </section>
  );
}
