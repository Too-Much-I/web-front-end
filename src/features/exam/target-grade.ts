export interface TargetGradeOption {
  id: string;
  /** 토익스피킹 등급 (예: "AH (Advanced High)") */
  levelLabel: string;
  /** 점수대 표시용 텍스트 (예: "180~190점") */
  scoreLabel: string;
  /** 해당 등급을 받기 위한 최소 점수. 목표 달성 여부 계산 기준값 (0~200점 척도) */
  score: number;
}

/** ETS 공식 토익스피킹 능숙도 등급별 점수대. 등급마다 한 행씩만 존재한다. */
export const TARGET_GRADE_OPTIONS: TargetGradeOption[] = [
  { id: "ah", levelLabel: "Advanced High", scoreLabel: "200점", score: 200 },
  { id: "am", levelLabel: "Advanced Mid", scoreLabel: "180~190점", score: 180 },
  { id: "al", levelLabel: "Advanced Low", scoreLabel: "160~170점", score: 160 },
  { id: "ih", levelLabel: "Intermediate High", scoreLabel: "140~150점", score: 140 },
  { id: "im3", levelLabel: "Intermediate Mid 3", scoreLabel: "130점", score: 130 },
  { id: "im2", levelLabel: "Intermediate Mid 2", scoreLabel: "120점", score: 120 },
  { id: "im1", levelLabel: "Intermediate Mid 1", scoreLabel: "110점", score: 110 },
  { id: "il", levelLabel: "Intermediate Low", scoreLabel: "90~100점", score: 90 },
  { id: "nh", levelLabel: "Novice High", scoreLabel: "60~80점", score: 60 },
  { id: "nml", levelLabel: "Novice Mid / Low", scoreLabel: "0~50점", score: 0 },
];

const STORAGE_KEY = "toeic-target-grade-id";

export function getStoredTargetGradeId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredTargetGradeId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function getTargetGradeOption(id: string | null): TargetGradeOption | null {
  if (!id) return null;
  return TARGET_GRADE_OPTIONS.find((option) => option.id === id) ?? null;
}
