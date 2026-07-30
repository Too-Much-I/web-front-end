export interface TargetGradeOption {
  id: string;
  /** 좁은 화면의 등급 배지에 쓰는 축약 코드 (예: "IM1") */
  abbreviation: string;
  /** 토익스피킹 등급 (예: "AH (Advanced High)") */
  levelLabel: string;
  /** 점수대 표시용 텍스트 (예: "180~190점") */
  scoreLabel: string;
  /** 해당 등급을 받기 위한 최소 점수. 목표 달성 여부 계산 기준값 (0~200점 척도) */
  score: number;
}

/** ETS 공식 토익스피킹 능숙도 등급별 점수대. 등급마다 한 행씩만 존재한다. */
export const TARGET_GRADE_OPTIONS: TargetGradeOption[] = [
  {
    id: "ah",
    abbreviation: "AH",
    levelLabel: "Advanced High",
    scoreLabel: "200점",
    score: 200,
  },
  {
    id: "am",
    abbreviation: "AM",
    levelLabel: "Advanced Mid",
    scoreLabel: "180~190점",
    score: 180,
  },
  {
    id: "al",
    abbreviation: "AL",
    levelLabel: "Advanced Low",
    scoreLabel: "160~170점",
    score: 160,
  },
  {
    id: "ih",
    abbreviation: "IH",
    levelLabel: "Intermediate High",
    scoreLabel: "140~150점",
    score: 140,
  },
  {
    id: "im3",
    abbreviation: "IM3",
    levelLabel: "Intermediate Mid 3",
    scoreLabel: "130점",
    score: 130,
  },
  {
    id: "im2",
    abbreviation: "IM2",
    levelLabel: "Intermediate Mid 2",
    scoreLabel: "120점",
    score: 120,
  },
  {
    id: "im1",
    abbreviation: "IM1",
    levelLabel: "Intermediate Mid 1",
    scoreLabel: "110점",
    score: 110,
  },
  {
    id: "il",
    abbreviation: "IL",
    levelLabel: "Intermediate Low",
    scoreLabel: "90~100점",
    score: 90,
  },
  {
    id: "nh",
    abbreviation: "NH",
    levelLabel: "Novice High",
    scoreLabel: "60~80점",
    score: 60,
  },
  {
    id: "nml",
    abbreviation: "NM/NL",
    levelLabel: "Novice Mid / Low",
    scoreLabel: "0~50점",
    score: 0,
  },
];

/** 비교에 영향을 주지 않는 공백·괄호·구분자·보이지 않는 문자를 제거한다. */
function normalizeLevelForComparison(level: string): string {
  return level
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** 두 문자열을 같게 만들기 위해 필요한 삽입·삭제·교체 횟수를 구한다. */
function getEditDistance(source: string, target: string): number {
  const previousRow = Array.from(
    { length: target.length + 1 },
    (_, index) => index,
  );

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex += 1) {
    let diagonal = previousRow[0];
    previousRow[0] = sourceIndex;

    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      const above = previousRow[targetIndex];
      const substitutionCost =
        source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;

      previousRow[targetIndex] = Math.min(
        previousRow[targetIndex] + 1,
        previousRow[targetIndex - 1] + 1,
        diagonal + substitutionCost,
      );
      diagonal = above;
    }
  }

  return previousRow[target.length];
}

/** 오타가 있더라도 충분히 가깝고 후보가 하나로 명확한 전체 등급명을 찾는다. */
function findFuzzyLevelOption(normalizedLevel: string) {
  // AH, IM1 같은 짧은 코드의 오타까지 추측하면 다른 등급으로 잘못 매핑하기 쉽다.
  if (normalizedLevel.length < 7) return null;

  const candidates = TARGET_GRADE_OPTIONS.map((option) => {
    const normalizedLabel = normalizeLevelForComparison(option.levelLabel);
    return {
      option,
      distance: getEditDistance(normalizedLevel, normalizedLabel),
      allowedDistance: Math.max(1, Math.floor(normalizedLabel.length * 0.2)),
    };
  }).sort((left, right) => left.distance - right.distance);

  const [closest, secondClosest] = candidates;
  if (
    !closest ||
    closest.distance > closest.allowedDistance ||
    closest.distance === secondClosest?.distance
  ) {
    return null;
  }

  return closest.option;
}

/** 서버의 전체 등급명(또는 이미 축약된 코드)을 오타까지 보정해 축약 코드로 바꾼다. */
export function getLevelAbbreviation(levelEstimate: string): string {
  const normalizedLevel = normalizeLevelForComparison(levelEstimate);
  const exactOption = TARGET_GRADE_OPTIONS.find(
    ({ abbreviation, levelLabel }) =>
      normalizeLevelForComparison(abbreviation) === normalizedLevel ||
      normalizedLevel.includes(normalizeLevelForComparison(levelLabel)),
  );
  const option = exactOption ?? findFuzzyLevelOption(normalizedLevel);

  return option?.abbreviation ?? levelEstimate;
}

const STORAGE_KEY = "toeic-target-grade-id";

export function getStoredTargetGradeId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredTargetGradeId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function getTargetGradeOption(
  id: string | null,
): TargetGradeOption | null {
  if (!id) return null;
  return TARGET_GRADE_OPTIONS.find((option) => option.id === id) ?? null;
}
