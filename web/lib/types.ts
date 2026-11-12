export type StudyItemType = "QUESTION" | "NOTE" | "FORMULA" | "FLASHCARD";

export type ReviewResult = "AGAIN" | "HARD" | "GOOD" | "EASY" | "MEMORIZED";

export interface StudyItem {
  id: string;
  title?: string;
  content?: string;
  type: StudyItemType;
  options?: string[];
  correctAnswerIndex?: number;
  nextReviewAt: string | null;
  lastIntervalDays?: number;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  studyItemId: string;
  result: ReviewResult;
  intervalDays: number;
  isCorrect?: boolean;
  reviewedAt: string;
  nextReviewAt: string;
}

export interface DashboardStats {
  totalItems: number;
  dueToday: number;
  upcoming: number;
  completedToday: number;
  streakDays: number;
  recentActivity: Array<{ title: string; reviewedAt: string }>;
}
