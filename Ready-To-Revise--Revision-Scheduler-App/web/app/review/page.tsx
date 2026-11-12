"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  RotateCcw,
  Timer,
  X,
} from "lucide-react";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  Spinner,
  cn,
} from "@/components/ui";
import { AppShell } from "@/components/app-shell";
import { apiGet, apiPostJson } from "@/lib/api";
import {
  getItem,
  getDueItems,
  isAuthed,
  recordReview,
} from "@/lib/local-store";
import { formatTimer, dueBeforeISO } from "@/lib/utils";
import { inferResult, type ConfidenceObservables } from "@/lib/scheduler";
import type { ReviewResult } from "@/lib/types";

interface QueueItem {
  id: string;
  title: string;
  options: string[];
}

interface Feedback {
  result: ReviewResult;
  isCorrect?: boolean;
  correctIndex?: number;
  nextInDays: number;
}

type Phase = "loading" | "empty" | "session" | "summary";

export default function ReviewPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [guest, setGuest] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerChanges, setAnswerChanges] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [results, setResults] = useState<Array<{ isCorrect?: boolean }>>([]);

  const questionStartRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);

  const loadQueue = useCallback(async () => {
    setError(null);
    if (!isAuthed()) {
      setGuest(true);
      const due = getDueItems().map((item) => ({
        id: item.id,
        title: item.title ?? "",
        options: item.options ?? [],
      }));
      if (due.length === 0) {
        setPhase("empty");
        return;
      }
      setQueue(due);
      startSession();
      return;
    }

    setGuest(false);
    try {
      const data = await apiGet<{ source: string; items: Array<{
        studyItemId: string;
        title: string | null;
        options: string[] | null;
      }> }>(
        `/recommendations?limit=20&dueBefore=${encodeURIComponent(dueBeforeISO())}`,
      );
      const items = (data.items ?? [])
        .filter((i) => i.options && i.options.length >= 2)
        .map((i) => ({
          id: i.studyItemId,
          title: i.title ?? "",
          options: i.options as string[],
        }));

      if (items.length === 0) {
        setPhase("empty");
        return;
      }
      setQueue(items);
      startSession();
    } catch (e: any) {
      setError(e.message || "Failed to load recommendations.");
      setPhase("empty");
    }
  }, []);

  function startSession() {
    setIndex(0);
    setSelected(null);
    setAnswerChanges(0);
    setFeedback(null);
    setResults([]);
    setTotalElapsed(0);
    sessionStartRef.current = Date.now();
    questionStartRef.current = Date.now();
    setPhase("session");
  }

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (phase !== "session") return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - questionStartRef.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [phase, index]);

  const current = queue[index];

  const choose = (optionIndex: number) => {
    if (feedback) return;
    if (selected !== null) setAnswerChanges((c) => c + 1);
    setSelected(optionIndex);
  };

  const check = async () => {
    if (selected === null || !current || feedback) return;
    setSubmitting(true);
    setError(null);

    const observables: ConfidenceObservables = {
      isCorrect: false,
      responseTimeMs: Date.now() - questionStartRef.current,
      answerChanges,
    };

    try {
      if (guest) {
        const item = getItem(current.id);
        if (!item) throw new Error("Item no longer exists.");
        const isCorrect = selected === item.correctAnswerIndex;
        const result = inferResult({ ...observables, isCorrect });
        const record = recordReview({ item, result, isCorrect });
        setFeedback({
          result,
          isCorrect,
          correctIndex: item.correctAnswerIndex,
          nextInDays: record.intervalDays,
        });
      } else {
        const res = await apiPostJson<{
          result: ReviewResult;
          isCorrect?: boolean;
          intervalDays: number;
        }>("/reviews", {
          studyItemId: current.id,
          selectedOptionIndex: selected,
          responseTimeMs: observables.responseTimeMs,
          answerChanges,
        });
        setFeedback({
          result: res.result,
          isCorrect: res.isCorrect,
          nextInDays: res.intervalDays,
        });
      }
      setResults((prev) => [
        ...prev,
        { isCorrect: guest ? selected === getItem(current.id)?.correctAnswerIndex : undefined },
      ]);
    } catch (e: any) {
      setError(e.message || "Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const memorize = async () => {
    if (!current || feedback) return;
    setSubmitting(true);
    setError(null);
    try {
      if (guest) {
        const item = getItem(current.id);
        if (!item) throw new Error("Item no longer exists.");
        const record = recordReview({ item, result: "MEMORIZED" });
        setFeedback({
          result: "MEMORIZED",
          correctIndex: item.correctAnswerIndex,
          nextInDays: record.intervalDays,
        });
      } else {
        const res = await apiPostJson<{ intervalDays: number }>(
          "/reviews/self-grade",
          {
            studyItemId: current.id,
            responseTimeMs: Date.now() - questionStartRef.current,
          },
        );
        setFeedback({ result: "MEMORIZED", nextInDays: res.intervalDays });
      }
      setResults((prev) => [...prev, { isCorrect: undefined }]);
    } catch (e: any) {
      setError(e.message || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    setTotalElapsed((t) => t + Math.floor((Date.now() - questionStartRef.current) / 1000));
    if (index + 1 >= queue.length) {
      setPhase("summary");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswerChanges(0);
    setFeedback(null);
    questionStartRef.current = Date.now();
  };

  const correctCount = useMemo(
    () => results.filter((r) => r.isCorrect === true).length,
    [results],
  );
  const answeredCount = results.length;

  /* ------------------------------- Screens ------------------------------- */

  if (phase === "loading") {
    return (
      <AppShell>
        <div className="flex justify-center py-32">
          <Spinner className="size-6 text-brand-600" />
        </div>
      </AppShell>
    );
  }

  if (phase === "empty") {
    return (
      <AppShell>
        <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
          {error && (
            <Alert variant="error" className="mb-6 w-full text-left">
              {error}
            </Alert>
          )}
          <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CircleCheck className="size-7" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            All caught up!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {guest && results.length === 0
              ? "No questions are due for revision right now."
              : "Nothing else is due right now. Come back later."}
          </p>
          <div className="mt-7 flex gap-2">
            <ButtonLink href="/dashboard" variant="outline">
              Back to dashboard
            </ButtonLink>
            {guest && (
              <ButtonLink href="/dashboard" variant="secondary">
                Add more questions
              </ButtonLink>
            )}
          </div>
        </main>
      </AppShell>
    );
  }

  if (phase === "summary") {
    return (
      <AppShell>
        <main className="mx-auto max-w-xl px-4 py-20 sm:px-6">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Session complete
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {answeredCount} {answeredCount === 1 ? "question" : "questions"} reviewed
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <SummaryStat label="Correct" value={correctCount} tone="emerald" />
              <SummaryStat
                label="Missed"
                value={results.filter((r) => r.isCorrect === false).length}
                tone="rose"
              />
              <SummaryStat
                label="Time"
                value={formatTimer(totalElapsed)}
                tone="slate"
              />
            </div>

            {guest && (
              <Alert variant="info" className="mt-6 text-left">
                Guest progress is saved on this device.{" "}
                <Link href="/register" className="font-medium underline underline-offset-2">
                  Create an account
                </Link>{" "}
                to keep it in sync.
              </Alert>
            )}

            <div className="mt-7 flex justify-center gap-2">
              <ButtonLink href="/dashboard" variant="outline">
                Dashboard
              </ButtonLink>
              <Button onClick={loadQueue}>
                <RotateCcw className="size-4" />
                Revise again
              </Button>
            </div>
          </Card>
        </main>
      </AppShell>
    );
  }

  /* --------------------------- Session screen --------------------------- */

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Progress header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {index + 1} / {queue.length}
            </span>
            <span className="text-xs text-slate-400">
              · {correctCount} correct so far
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Timer className="size-4" />
            {formatTimer(elapsed)}
          </div>
        </div>
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${((index + (feedback ? 1 : 0)) / queue.length) * 100}%` }}
          />
        </div>

        {error && (
          <Alert variant="error" className="mb-5">
            {error}
          </Alert>
        )}

        {current && (
          <Card className="p-6 sm:p-8">
            <h1 className="text-lg font-semibold leading-relaxed text-slate-900">
              {current.title || "Untitled question"}
            </h1>

            <div className="mt-6 flex flex-col gap-2.5">
              {current.options.map((option, i) => {
                const isSelected = selected === i;
                const isCorrectOption = feedback?.correctIndex === i;
                const isWrongPick =
                  feedback && feedback.isCorrect === false && isSelected;

                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={!!feedback || submitting}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      feedback && isCorrectOption
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : feedback && isWrongPick
                          ? "border-red-300 bg-red-50 text-red-900"
                          : isSelected
                            ? "border-brand-500 bg-brand-50 text-brand-900 ring-1 ring-brand-500"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                      feedback && "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold",
                        feedback && isCorrectOption
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : feedback && isWrongPick
                            ? "border-red-400 bg-red-400 text-white"
                            : isSelected
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-slate-300 text-slate-400",
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {feedback && isCorrectOption && (
                      <CircleCheck className="size-4 shrink-0 text-emerald-600" />
                    )}
                    {feedback && isWrongPick && (
                      <CircleAlert className="size-4 shrink-0 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <Alert
                variant={
                  feedback.result === "MEMORIZED"
                    ? "success"
                    : feedback.isCorrect === false
                      ? "error"
                      : "success"
                }
                className="mt-5"
              >
                {feedback.result === "MEMORIZED"
                  ? "Marked as memorized — next review in "
                  : feedback.isCorrect === false
                    ? "Not quite — next review in "
                    : "Correct — next review in "}
                <strong>
                  {feedback.nextInDays === 1 ? "1 day" : `${feedback.nextInDays} days`}
                </strong>
                .
              </Alert>
            )}

            <div className="mt-7 flex items-center justify-between gap-3">
              {!feedback ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={memorize}
                    loading={submitting}
                    title="I already know this — schedule a long review"
                  >
                    Memorized
                  </Button>
                  <Button
                    size="lg"
                    onClick={check}
                    disabled={selected === null}
                    loading={submitting}
                  >
                    Check answer
                    <ArrowRight className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-400">
                    {guest ? "Saved on this device" : "Saved to your account"}
                  </span>
                  <Button size="lg" onClick={next}>
                    {index + 1 >= queue.length ? "Finish" : "Next question"}
                    <ArrowRight className="size-4" />
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}
      </main>
    </AppShell>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "emerald" | "rose" | "slate";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-700",
  } as const;

  return (
    <div className={cn("rounded-xl px-3 py-4", tones[tone])}>
      <p className="text-xl font-semibold">{value}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide opacity-75">
        {label}
      </p>
    </div>
  );
}
