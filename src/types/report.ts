export type ScoreCategory =
  "pronunciation" | "fluency" | "grammar" | "vocabulary" | "topicRelevance";

export type CategoryGrade = "Excellent" | "Good" | "Fair" | "Needs Work";

export interface CategoryScore {
  category: ScoreCategory;
  grade: CategoryGrade;
  /** Reasons the grade was reduced, cited against the ETS/CEFR basis below. */
  deductionReasons: string[];
  etsRubricBasis: string;
  cefrBasis: string;
  /** User's value plotted against the target-grade cohort average, e.g. 0-100. */
  userScore: number;
  cohortAverageScore: number;
}

export interface ScoreReport {
  attemptId: string;
  targetGrade: string;
  estimatedScoreRange: {
    min: number;
    max: number;
  };
  categories: CategoryScore[];
  createdAt: string;
}
