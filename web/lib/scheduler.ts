import type { ReviewResult } from "./types";

type GradeKey = Exclude<ReviewResult, "AGAIN" | "MEMORIZED">;

const BASE_INTERVAL_DAYS: Record<GradeKey, number> = {
  HARD: 3,
  GOOD: 7,
  EASY: 14,
};

const EXPANSION_MULTIPLIERS: Record<GradeKey, number> = {
  HARD: 1.2,
  GOOD: 1.9,
  EASY: 2.6,
};

const MEMORY_MULTIPLIER = 1.5;
const MAX_INTERVAL_DAYS = 365;
const AGAIN_INTERVAL_DAYS = 1;

export function calculateInterval(
  result: ReviewResult,
  previousIntervalDays?: number | null,
): number {
  if (result === "AGAIN") {
    return AGAIN_INTERVAL_DAYS;
  }

  if (result === "MEMORIZED") {
    const goodInterval = progressGood(previousIntervalDays);
    return Math.min(MAX_INTERVAL_DAYS, Math.ceil(goodInterval * MEMORY_MULTIPLIER));
  }

  const base = BASE_INTERVAL_DAYS[result];

  if (previousIntervalDays === undefined || previousIntervalDays === null || previousIntervalDays <= 0) {
    return base;
  }

  const expanded = Math.ceil(previousIntervalDays * EXPANSION_MULTIPLIERS[result]);

  return Math.min(MAX_INTERVAL_DAYS, Math.max(base, expanded));
}

export function nextReviewAtISO(intervalDays: number): string {
  const next = new Date();
  next.setDate(next.getDate() + intervalDays);
  return next.toISOString();
}

function progressGood(previousIntervalDays?: number | null): number {
  const base = BASE_INTERVAL_DAYS.GOOD;

  if (previousIntervalDays === undefined || previousIntervalDays === null || previousIntervalDays <= 0) {
    return base;
  }

  const expanded = Math.ceil(previousIntervalDays * EXPANSION_MULTIPLIERS.GOOD);
  return Math.max(base, expanded);
}

/* ---------------------- Confidence inference (backend port) ---------------------- */

const CONFIDENCE_WEIGHTS = {
  correct: 0.4,
  responseTime: 0.25,
  hesitation: 0.2,
  answerChange: 0.15,
} as const;

const SIMULATION_LIMITS = {
  maxResponseTimeSeconds: 120.0,
  maxHesitationSeconds: 30.0,
  maxAnswerChanges: 5,
} as const;

const LOW_CONFIDENCE_THRESHOLD = 0.4;
const HIGH_CONFIDENCE_THRESHOLD = 0.75;

export interface ConfidenceObservables {
  isCorrect: boolean;
  responseTimeMs?: number | null;
  hesitationMs?: number | null;
  answerChanges?: number | null;
}

export function inferResult(observables: ConfidenceObservables): ReviewResult {
  if (!observables.isCorrect) {
    return "AGAIN";
  }

  const responseScore = normalize(observables.responseTimeMs, SIMULATION_LIMITS.maxResponseTimeSeconds);
  const hesitationScore = normalize(observables.hesitationMs, SIMULATION_LIMITS.maxHesitationSeconds);
  const answerChangeScore = normalize(observables.answerChanges, SIMULATION_LIMITS.maxAnswerChanges);

  const score =
    CONFIDENCE_WEIGHTS.correct * 1.0 +
    CONFIDENCE_WEIGHTS.responseTime * responseScore +
    CONFIDENCE_WEIGHTS.hesitation * hesitationScore +
    CONFIDENCE_WEIGHTS.answerChange * answerChangeScore;

  if (score < LOW_CONFIDENCE_THRESHOLD) return "HARD";
  if (score < HIGH_CONFIDENCE_THRESHOLD) return "GOOD";
  return "EASY";
}

function normalize(value: number | null | undefined, max: number): number {
  if (value === undefined || value === null) {
    return 0.5;
  }
  return 1.0 - Math.min(value / max, 1.0);
}
