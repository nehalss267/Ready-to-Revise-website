import { calculateInterval, nextReviewAtISO } from "./scheduler";
import { formatDueDate } from "./utils";
import type {
  DashboardStats,
  ReviewRecord,
  ReviewResult,
  StudyItem,
  StudyItemType,
} from "./types";

const ITEMS_KEY = "r2r_items_v1";
const REVIEWS_KEY = "r2r_reviews_v1";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("r2r_token");
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function listItems(): StudyItem[] {
  return read<StudyItem>(ITEMS_KEY);
}

export function listReviews(): ReviewRecord[] {
  return read<ReviewRecord>(REVIEWS_KEY);
}

export function getItem(id: string): StudyItem | undefined {
  return listItems().find((i) => i.id === id);
}

export function saveItem(input: {
  title: string;
  content?: string;
  type: StudyItemType;
  options?: string[];
  correctAnswerIndex?: number;
}): StudyItem {
  const item: StudyItem = {
    id: crypto.randomUUID(),
    title: input.title,
    content: input.content,
    type: input.type,
    options: input.options,
    correctAnswerIndex: input.correctAnswerIndex,
    nextReviewAt: input.type === "QUESTION" ? nextReviewAtISO(1) : null,
    lastIntervalDays: input.type === "QUESTION" ? 1 : undefined,
    createdAt: new Date().toISOString(),
  };

  const items = listItems();
  items.push(item);
  write(ITEMS_KEY, items);
  return item;
}

export function deleteItem(id: string): void {
  write(ITEMS_KEY, listItems().filter((i) => i.id !== id));
}

export function recordReview(input: {
  item: StudyItem;
  result: ReviewResult;
  isCorrect?: boolean;
}): ReviewRecord {
  const intervalDays = calculateInterval(input.result, input.item.lastIntervalDays);
  const nextReviewAt = nextReviewAtISO(intervalDays);

  const record: ReviewRecord = {
    id: crypto.randomUUID(),
    studyItemId: input.item.id,
    result: input.result,
    intervalDays,
    isCorrect: input.isCorrect,
    reviewedAt: new Date().toISOString(),
    nextReviewAt,
  };

  const items = listItems();
  const idx = items.findIndex((i) => i.id === input.item.id);
  if (idx !== -1) {
    items[idx] = {
      ...items[idx],
      nextReviewAt,
      lastIntervalDays: intervalDays,
    };
    write(ITEMS_KEY, items);
  }

  const reviews = listReviews();
  reviews.push(record);
  write(REVIEWS_KEY, reviews);

  return record;
}

export function getDueItems(): StudyItem[] {
  const endOfToday = endOfTodayMs();
  return listItems()
    .filter(
      (i) =>
        i.type === "QUESTION" &&
        i.options &&
        i.options.length >= 2 &&
        i.correctAnswerIndex !== undefined &&
        i.nextReviewAt &&
        new Date(i.nextReviewAt).getTime() <= endOfToday,
    )
    .sort(
      (a, b) =>
        new Date(a.nextReviewAt!).getTime() - new Date(b.nextReviewAt!).getTime(),
    );
}

export function getDashboardStats(): DashboardStats {
  const items = listItems();
  const reviews = listReviews();
  const endOfToday = endOfTodayMs();

  const dueToday = items.filter(
    (i) =>
      i.type === "QUESTION" &&
      i.nextReviewAt &&
      new Date(i.nextReviewAt).getTime() <= endOfToday,
  ).length;

  const upcoming = items.filter(
    (i) =>
      i.type === "QUESTION" &&
      i.nextReviewAt &&
      new Date(i.nextReviewAt).getTime() > endOfToday,
  ).length;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();

  const completedToday = reviews.filter(
    (r) => new Date(r.reviewedAt).getTime() >= startOfTodayMs,
  ).length;

  return {
    totalItems: items.length,
    dueToday,
    upcoming,
    completedToday,
    streakDays: computeStreakDays(reviews),
    recentActivity: [...reviews]
      .sort(
        (a, b) =>
          new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime(),
      )
      .slice(0, 8)
      .map((r) => {
        const item = items.find((i) => i.id === r.studyItemId);
        return {
          title: item?.title ?? "Deleted item",
          reviewedAt: r.reviewedAt,
        };
      }),
  };
}

export function hasLocalData(): boolean {
  return listItems().length > 0;
}

export function formatDue(dueAt: string | null): string {
  if (!dueAt) return "No schedule";
  return formatDueDate(new Date(dueAt));
}

function endOfTodayMs(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function computeStreakDays(reviews: ReviewRecord[]): number {
  const days = new Set(
    reviews.map((r) => {
      const d = new Date(r.reviewedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );

  const sorted = [...days].sort((a, b) => b - a);
  if (sorted.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  // Streak must include today or yesterday to be "active"
  if (sorted[0] !== todayMs && sorted[0] !== todayMs - dayMs) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] === dayMs) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
