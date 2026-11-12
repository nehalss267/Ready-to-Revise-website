import { listItems, listReviews } from "./local-store";
import type { StudyItemType } from "./types";

export interface AnalyticsSummary {
  totalReviews: number;
  accuracyPct: number;
  currentStreak: number;
  longestStreak: number;
  completionToday: number;
  studyItems: number;
  dueToday: number;
}

export interface AnalyticsDailyPoint {
  date: string;
  completed: number;
  accuracyPct: number;
  minutes: number;
}

export interface AnalyticsSubjectRow {
  name: string;
  items: number;
  due: number;
  reviews: number;
  accuracyPct: number;
}

export interface AnalyticsRecentRow {
  title: string;
  reviewedAt: string;
  isCorrect: boolean | null;
}

export interface AnalyticsOverview {
  range: "7d" | "30d";
  summary: AnalyticsSummary;
  daily: AnalyticsDailyPoint[];
  subjects: AnalyticsSubjectRow[];
  recent: AnalyticsRecentRow[];
}

export interface AnalyticsHeatmap {
  startDate: string;
  days: Array<{ date: string; completed: number; level: number }>;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HEATMAP_DAYS = 365;

const TYPE_LABELS: Record<StudyItemType, string> = {
  QUESTION: "Questions",
  NOTE: "Notes",
  FLASHCARD: "Flashcards",
  FORMULA: "Formulas",
};

export function levelOf(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function utcStartOfDay(date: Date): Date {
  return new Date(`${utcDateKey(date)}T00:00:00.000Z`);
}

export function getLocalAnalytics(range: "7d" | "30d"): AnalyticsOverview {
  const days = range === "30d" ? 30 : 7;
  const now = new Date();
  const todayKey = utcDateKey(now);
  const rangeStart = new Date(
    utcStartOfDay(now).getTime() - (days - 1) * MS_PER_DAY,
  );

  const items = listItems();
  const reviews = listReviews();

  const graded = reviews.filter((r) => r.isCorrect !== undefined && r.isCorrect !== null);
  const correct = graded.filter((r) => r.isCorrect === true).length;

  const startOfTodayMs = utcStartOfDay(now).getTime();
  const endOfTodayMs = startOfTodayMs + MS_PER_DAY - 1;

  const completedToday = reviews.filter(
    (r) => new Date(r.reviewedAt).getTime() >= startOfTodayMs,
  ).length;
  const dueToday = items.filter(
    (i) =>
      i.type === "QUESTION" &&
      i.nextReviewAt &&
      new Date(i.nextReviewAt).getTime() <= endOfTodayMs,
  ).length;

  // Daily buckets
  const buckets = new Map<string, { completed: number; correct: number; incorrect: number }>();
  for (let i = 0; i < days; i++) {
    buckets.set(utcDateKey(new Date(rangeStart.getTime() + i * MS_PER_DAY)), {
      completed: 0,
      correct: 0,
      incorrect: 0,
    });
  }
  for (const r of reviews) {
    const key = utcDateKey(new Date(r.reviewedAt));
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.completed += 1;
    if (r.isCorrect === true) bucket.correct += 1;
    else if (r.isCorrect === false) bucket.incorrect += 1;
  }

  const daily: AnalyticsDailyPoint[] = Array.from(buckets.entries()).map(
    ([date, b]) => {
      const g = b.correct + b.incorrect;
      return {
        date,
        completed: b.completed,
        accuracyPct: g > 0 ? Math.round((100 * b.correct) / g) : 0,
        minutes: 0,
      };
    },
  );

  // Pseudo-subjects grouped by item type (guests have no subject hierarchy)
  const byType = new Map<StudyItemType, StudyItemLite[]>();
  for (const item of items) {
    const list = byType.get(item.type) ?? [];
    list.push(item);
    byType.set(item.type, list);
  }

  const subjects: AnalyticsSubjectRow[] = Array.from(byType.entries())
    .map(([type, list]) => {
      const ids = new Set(list.map((i) => i.id));
      const typeReviews = reviews.filter((r) => ids.has(r.studyItemId));
      const g = typeReviews.filter((r) => r.isCorrect !== undefined && r.isCorrect !== null);
      const c = g.filter((r) => r.isCorrect === true).length;
      return {
        name: TYPE_LABELS[type],
        items: list.length,
        due: list.filter(
          (i) =>
            i.type === "QUESTION" &&
            i.nextReviewAt &&
            new Date(i.nextReviewAt).getTime() <= endOfTodayMs,
        ).length,
        reviews: typeReviews.length,
        accuracyPct: g.length > 0 ? Math.round((100 * c) / g.length) : 0,
      };
    })
    .sort((a, b) => b.items - a.items);

  const recent: AnalyticsRecentRow[] = [...reviews]
    .sort(
      (a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime(),
    )
    .slice(0, 10)
    .map((r) => ({
      title: items.find((i) => i.id === r.studyItemId)?.title ?? "Deleted item",
      reviewedAt: r.reviewedAt,
      isCorrect: r.isCorrect ?? null,
    }));

  const reviewDates = reviews.map((r) => utcDateKey(new Date(r.reviewedAt)));

  return {
    range,
    summary: {
      totalReviews: reviews.filter(
        (r) => new Date(r.reviewedAt).getTime() >= rangeStart.getTime(),
      ).length,
      accuracyPct: graded.length > 0 ? Math.round((100 * correct) / graded.length) : 0,
      currentStreak: currentStreak(reviewDates, todayKey),
      longestStreak: longestStreak(reviewDates),
      completionToday:
        completedToday + dueToday > 0
          ? Math.round((100 * completedToday) / (completedToday + dueToday))
          : 0,
      studyItems: items.length,
      dueToday,
    },
    daily,
    subjects,
    recent,
  };
}

export function getLocalHeatmap(): AnalyticsHeatmap {
  const now = new Date();
  const startDate = new Date(
    utcStartOfDay(now).getTime() - (HEATMAP_DAYS - 1) * MS_PER_DAY,
  );

  const counts = new Map<string, number>();
  for (const r of listReviews()) {
    const key = utcDateKey(new Date(r.reviewedAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days = [];
  for (let i = 0; i < HEATMAP_DAYS; i++) {
    const date = new Date(startDate.getTime() + i * MS_PER_DAY);
    const key = utcDateKey(date);
    const completed = counts.get(key) ?? 0;
    days.push({ date: key, completed, level: levelOf(completed) });
  }

  return { startDate: utcDateKey(startDate), days };
}

function currentStreak(dates: string[], todayKey: string): number {
  const unique = new Set(dates);
  let cursor = new Date(`${todayKey}T00:00:00.000Z`).getTime();

  if (!unique.has(utcDateKey(new Date(cursor)))) {
    cursor -= MS_PER_DAY;
    if (!unique.has(utcDateKey(new Date(cursor)))) return 0;
  }

  let streak = 0;
  while (unique.has(utcDateKey(new Date(cursor)))) {
    streak += 1;
    cursor -= MS_PER_DAY;
  }
  return streak;
}

function longestStreak(dates: string[]): number {
  const sorted = Array.from(new Set(dates)).sort();
  let longest = 0;
  let run = 0;
  let previous = "";

  for (const date of sorted) {
    if (previous === "") {
      run = 1;
    } else {
      const gap = Date.parse(`${date}T00:00:00.000Z`) - Date.parse(`${previous}T00:00:00.000Z`);
      run = gap === MS_PER_DAY ? run + 1 : 1;
    }
    if (run > longest) longest = run;
    previous = date;
  }
  return longest;
}

interface StudyItemLite {
  id: string;
  type: StudyItemType;
  nextReviewAt: string | null;
}
