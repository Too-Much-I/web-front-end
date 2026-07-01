export type ExamPart =
  | "read_aloud"
  | "describe_picture"
  | "respond_questions"
  | "respond_with_info"
  | "express_opinion";

export interface ExamQuestion {
  id: string;
  part: ExamPart;
  order: number;
  prompt: string;
  imageUrl?: string;
  prepSeconds: number;
  responseSeconds: number;
}

export interface ExamAttempt {
  id: string;
  status: "in_progress" | "uploading" | "grading" | "completed" | "failed";
  startedAt: string;
}
