"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Pause,
  Play,
  RotateCcw,
  Timer,
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
  getSessionItems,
  isAuthed,
  recordReview,
} from "@/lib/local-store";
import { formatTimer, dueBeforeISO } from "@/lib/utils";
import { inferResult, type ConfidenceObservables } from "@/lib/scheduler";
import type { ReviewResult } from "@/lib/types";

interface QueueItem {
  id: string;
  title: string;
  content: string | null;
  options: string[] | null;
  kind: "MCQ" | "CARD";
}

interface SessionResult {
  item: QueueItem;
  skipped?: boolean;
  pick?: string;
  correct?: string;
  isCorrect?: boolean;
  result?: ReviewResult;
}

interface Feedback {
  result: ReviewResult;
  isCorrect?: boolean;
  correctIndex?: number;
  nextInDays: number;
}

type Phase = "loading" | "empty" | "session" | "summary";

const RESULT_META: Record<ReviewResult, { label: string; className: string }> = {
  EASY: { label: "Easy", className: "bg-emerald-100 text-emerald-700" },
  GOOD: { label: "Good", className: "bg-brand-100 text-brand-700" },
  HARD: { label: "Hard", className: "bg-amber-100 text-amber-700" },
  AGAIN: { label: "Again", className: "bg-red-100 text-red-600" },
  MEMORIZED: { label: "Memorized", className: "bg-emerald-100 text-emerald-700" },
};

export default function ReviewPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [guest, setGuest] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerChanges, setAnswerChanges] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SessionResult[]>([]);

  // Session clock with pause support
  const [paused, setPaused] = useState(false);
  const [clockDisplay, setClockDisplay] = useState({ session: 0, question: 0 });
  const clockRef = useRef({ sessionMs: 0, questionMs: 0, last: Date.now() });
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (phase !== "session") return;
    const t = setInterval(() => {
      const now = Date.now();
      if (!pausedRef.current) {
        clockRef.current.sessionMs += now - clockRef.current.last;
        clockRef.current.questionMs += now - clockRef.current.last;
      }
      clockRef.current.last = now;
      setClockDisplay({
        session: Math.floor(clockRef.current.sessionMs / 1000),
        question: Math.floor(clockRef.current.questionMs / 1000),
      });
    }, 500);
    return () => clearInterval(t);
  }, [phase]);

  const loadQueue = useCallback(async () => {
    setError(null);
    if (!isAuthed()) {
      setGuest(true);
      const items = getSessionItems().map((item) => ({
        id: item.id,
        title: item.title ?? "",
        content: item.content ?? null,
        options: item.options ?? null,
        kind: item.options && item.options.length >= 2 && item.correctAnswerIndex !== undefined
          ? ("MCQ" as const)
          : ("CARD" as const),
      }));
      if (items.length === 0) {
        setPhase("empty");
        return;
      }
      setQueue(items);
      startSession();
      return;
    }

    setGuest(false);
    try {
      const data = await apiGet<{
        items: Array<{
          studyItemId: string;
          title: string | null;
          options: string[] | null;
        }>;
      }>(
        `/recommendations?limit=20&dueBefore=${encodeURIComponent(dueBeforeISO())}`,
      );
      const items = (data.items ?? []).map((i) => ({
        id: i.studyItemId,
        title: i.title ?? "",
        content: null,
        options: i.options,
        kind:
          i.options && i.options.length >= 2
            ? ("MCQ" as const)
            : ("CARD" as const),
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
    setRevealed(false);
    setFeedback(null);
    setResults([]);
    clockRef.current = { sessionMs: 0, questionMs: 0, last: Date.now() };
    pausedRef.current = false;
    setPaused(false);
    setPhase("session");
  }

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const current = queue[index];

  const choose = (optionIndex: number) => {
    if (feedback || paused) return;
    if (selected !== null) setAnswerChanges((c) => c + 1);
    setSelected(optionIndex);
  };

  const check = async () => {
    if (selected === null || !current || feedback || paused) return;
    setSubmitting(true);
    setError(null);

    const responseTimeMs = clockRef.current.questionMs;
    const observables: ConfidenceObservables = {
      isCorrect: false,
      responseTimeMs,
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
        setResults((prev) => [
          ...prev,
          {
            item: current,
            pick: current.options?.[selected],
            correct: current.options?.[item.correctAnswerIndex!] ?? null,
            isCorrect,
            result,
          },
        ]);
      } else {
        const res = await apiPostJson<{
          result: ReviewResult;
          isCorrect?: boolean;
          intervalDays: number;
        }>("/reviews", {
          studyItemId: current.id,
          selectedOptionIndex: selected,
          responseTimeMs,
          answerChanges,
        });
        setFeedback({
          result: res.result,
          isCorrect: res.isCorrect,
          nextInDays: res.intervalDays,
        });
        setResults((prev) => [
          ...prev,
          {
            item: current,
            pick: current.options?.[selected],
            isCorrect: res.isCorrect,
            result: res.result,
          },
        ]);
      }
    } catch (e: any) {
      setError(e.message || "Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const memorize = async () => {
    if (!current || feedback || paused) return;
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
        setResults((prev) => [
          ...prev,
          { item: current, result: "MEMORIZED", isCorrect: undefined },
        ]);
      } else {
        const res = await apiPostJson<{ intervalDays: number }>(
          "/reviews/self-grade",
          {
            studyItemId: current.id,
            responseTimeMs: clockRef.current.questionMs,
          },
        );
        setFeedback({ result: "MEMORIZED", nextInDays: res.intervalDays });
        setResults((prev) => [
          ...prev,
          { item: current, result: "MEMORIZED" },
        ]);
      }
    } catch (e: any) {
      setError(e.message || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  const gradeFlashcard = async (result: Exclude<ReviewResult, "EASY" | "GOOD" | "HARD">) => {
    if (!current || feedback || paused) return;
    if (!guest) {
      // API only supports MEMORIZED self-grading
      return memorize();
    }
    const item = getItem(current.id);
    if (!item) {
      setError("Item no longer exists.");
      return;
    }
    const record = recordReview({ item, result });
    setFeedback({ result, nextInDays: record.intervalDays });
    setResults((prev) => [...prev, { item: current, result }]);
  };

  const skip = () => {
    if (!current || feedback) return;
    setResults((prev) => [...prev, { item: current, skipped: true }]);
    advance();
  };

  const next = () => advance();

  const advance = () => {
    if (index + 1 >= queue.length) {
      setPhase("summary");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswerChanges(0);
    setRevealed(false);
    setFeedback(null);
    clockRef.current.questionMs = 0;
    clockRef.current.last = Date.now();
  };

  /* --------------------------- Keyboard shortcuts --------------------------- */

  const keyHandler = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== "session") return;

      if (e.key === "Escape") {
        setPaused((p) => !p);
        return;
      }

      if (paused) return;

      if (feedback) {
        if (e.key === "Enter") {
          e.preventDefault();
          next();
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (current?.kind === "MCQ") {
        const letters = "abcd";
        const letterIdx = letters.indexOf(key);
        const numberIdx = /^[1-6]$/.test(key) ? Number(key) - 1 : -1;
        const optionIdx = letterIdx >= 0 ? letterIdx : numberIdx;

        if (optionIdx >= 0 && optionIdx < (current.options?.length ?? 0)) {
          e.preventDefault();
          choose(optionIdx);
          return;
        }
        if (key === "enter" && selected !== null) {
          e.preventDefault();
          check();
          return;
        }
      }
      if (current?.kind === "CARD" && !revealed) {
        if (key === "enter" || key === " ") {
          e.preventDefault();
          setRevealed(true);
        }
        return;
      }
      if (key === "m") {
        e.preventDefault();
        if (current?.kind === "MCQ") memorize();
        else gradeFlashcard("MEMORIZED");
      }
      if (key === "a" && current?.kind === "CARD" && revealed && guest) {
        gradeFlashcard("AGAIN");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, paused, feedback, current, selected, revealed, guest, index, queue],
  );

  const handlerRef = useRef(keyHandler);
  handlerRef.current = keyHandler;
  useEffect(() => {
    const listener = (e: KeyboardEvent) => handlerRef.current(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  /* -------------------------------- Screens -------------------------------- */

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
            No questions, flashcards or notes are due right now.
          </p>
          <div className="mt-7 flex gap-2">
            <ButtonLink href="/dashboard" variant="outline">
              Back to dashboard
            </ButtonLink>
            {guest && (
              <ButtonLink href="/dashboard" variant="secondary">
                Add more items
              </ButtonLink>
            )}
          </div>
        </main>
      </AppShell>
    );
  }

  if (phase === "summary") {
    const graded = results.filter((r) => !r.skipped);
    const correctCount = results.filter((r) => r.isCorrect === true).length;
    const missedCount = results.filter((r) => r.isCorrect === false).length;

    return (
      <AppShell>
        <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
          <Card className="p-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Session complete
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {results.length} {results.length === 1 ? "card" : "cards"} ·{" "}
                {formatTimer(Math.floor(clockRef.current.sessionMs / 1000))} spent
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <SummaryStat label="Correct" value={correctCount} tone="emerald" />
                <SummaryStat label="Missed" value={missedCount} tone="rose" />
                <SummaryStat
                  label="Graded"
                  value={graded.length}
                  tone="slate"
                />
              </div>
            </div>

            {results.length > 0 && (
              <ul className="mt-8 divide-y divide-slate-100 border-y border-slate-100">
                {results.map((r, i) => (
                  <li key={i} className="py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {r.item.title || "Untitled"}
                        </p>
                        {r.item.kind === "MCQ" && r.pick && (
                          <p
                            className={cn(
                              "mt-0.5 text-xs",
                              r.isCorrect === false ? "text-red-500" : "text-slate-400",
                            )}
                          >
                            Your answer: {r.pick}
                            {r.isCorrect === false && r.correct && (
                              <span className="text-emerald-600"> · Correct: {r.correct}</span>
                            )}
                          </p>
                        )}
                      </div>
                      {r.skipped ? (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Skipped
                        </span>
                      ) : (
                        r.result && (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                              RESULT_META[r.result].className,
                            )}
                          >
                            {RESULT_META[r.result].label}
                          </span>
                        )
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

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

  const mcq = current?.kind === "MCQ";

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Progress header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {index + 1} / {queue.length}
            </span>
            <span className="text-xs text-slate-400">
              · {mcq ? "Question" : "Card"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5" title="Session / current card">
              <Timer className="size-4" />
              {formatTimer(clockDisplay.session)}
              <span className="text-slate-300">/</span>
              {formatTimer(clockDisplay.question)}
            </span>
            <button
              onClick={() => setPaused((p) => !p)}
              className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label={paused ? "Resume session" : "Pause session"}
              title={paused ? "Resume (Esc)" : "Pause (Esc)"}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
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
          <div className="relative">
            <Card
              className={cn(
                "p-6 transition-filter sm:p-8",
                paused && "pointer-events-none blur-sm",
              )}
            >
              {/* Prompt */}
              <h1 className="text-lg font-semibold leading-relaxed text-slate-900">
                {current.title || "Untitled"}
              </h1>

              {mcq ? (
                <>
                  <div className="mt-6 flex flex-col gap-2.5">
                    {current.options?.map((option, i) => {
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
                        {feedback.nextInDays === 1
                          ? "1 day"
                          : `${feedback.nextInDays} days`}
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
                          title="I already know this — schedule a long review (M)"
                        >
                          Memorized
                        </Button>
                        <Button
                          size="lg"
                          onClick={check}
                          disabled={selected === null}
                          loading={submitting}
                          title="Check answer (Enter)"
                        >
                          Check answer
                          <ArrowRight className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <NextRow guest={guest} isLast={index + 1 >= queue.length} onNext={next} />
                    )}
                  </div>
                </>
              ) : current?.content ? (
                /* Flashcard with answer */
                <>
                  {revealed ? (
                    <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                        Answer
                      </p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {current.content}
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-6 w-full"
                      size="lg"
                      onClick={() => setRevealed(true)}
                      title="Reveal answer (Enter)"
                    >
                      Reveal answer
                    </Button>
                  )}

                  {feedback && (
                    <Alert
                      variant={feedback.result === "AGAIN" ? "error" : "success"}
                      className="mt-5"
                    >
                      {feedback.result === "AGAIN"
                        ? "Scheduled for another look — next review in "
                        : "Marked as memorized — next review in "}
                      <strong>
                        {feedback.nextInDays === 1
                          ? "1 day"
                          : `${feedback.nextInDays} days`}
                      </strong>
                      .
                    </Alert>
                  )}

                  <div className="mt-7 flex items-center justify-between gap-3">
                    {!feedback ? (
                      revealed ? (
                        <>
                          {guest && (
                            <Button
                              variant="outline"
                              onClick={() => gradeFlashcard("AGAIN")}
                              title="Show it to me again soon (A)"
                            >
                              Again
                            </Button>
                          )}
                          <Button
                            onClick={() => gradeFlashcard("MEMORIZED")}
                            loading={submitting}
                            title="I remembered it (M)"
                          >
                            Got it
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Try to recall it before revealing.
                        </span>
                      )
                    ) : (
                      <NextRow guest={guest} isLast={index + 1 >= queue.length} onNext={next} />
                    )}
                  </div>
                </>
              ) : (
                /* Prompt-only card (note / authed non-MCQ) */
                <>
                  <p className="mt-3 text-xs text-slate-400">
                    Read it through and check if you still remember the details.
                  </p>

                  {feedback && (
                    <Alert variant="success" className="mt-5">
                      Marked as memorized — next review in{" "}
                      <strong>
                        {feedback.nextInDays === 1
                          ? "1 day"
                          : `${feedback.nextInDays} days`}
                      </strong>
                      .
                    </Alert>
                  )}

                  <div className="mt-7 flex items-center justify-between gap-3">
                    {!feedback ? (
                      <>
                        <Button variant="ghost" onClick={skip}>
                          Skip
                        </Button>
                        <Button
                          onClick={memorize}
                          loading={submitting}
                          title="Mark as memorized (M)"
                        >
                          Memorized
                        </Button>
                      </>
                    ) : (
                      <NextRow guest={guest} isLast={index + 1 >= queue.length} onNext={next} />
                    )}
                  </div>
                </>
              )}
            </Card>

            {paused && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="flex flex-col items-center px-10 py-8">
                  <Pause className="size-8 text-brand-600" />
                  <p className="mt-3 font-semibold text-slate-900">Paused</p>
                  <p className="mt-1 text-xs text-slate-500">
                    The clock is stopped.
                  </p>
                  <Button className="mt-5" onClick={() => setPaused(false)}>
                    <Play className="size-4" />
                    Resume
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Shortcut hints */}
        <p className="mt-5 text-center text-xs text-slate-400">
          {mcq ? "A–D or 1–6 pick · Enter checks" : "Enter reveals · M memorizes"}
          {" · "}Esc pauses
        </p>
      </main>
    </AppShell>
  );
}

function NextRow({
  guest,
  isLast,
  onNext,
}: {
  guest: boolean;
  isLast: boolean;
  onNext: () => void;
}) {
  return (
    <>
      <span className="text-xs text-slate-400">
        {guest ? "Saved on this device" : "Saved to your account"}
      </span>
      <Button size="lg" onClick={onNext} title="Next (Enter)">
        {isLast ? "Finish" : "Next card"}
        <ArrowRight className="size-4" />
      </Button>
    </>
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
