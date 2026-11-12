"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  cn,
} from "@/components/ui";
import { saveItem } from "@/lib/local-store";
import type { StudyItemType } from "@/lib/types";

const itemTypes: Array<{ value: StudyItemType; label: string; hint: string }> = [
  { value: "QUESTION", label: "Question", hint: "MCQ — scheduled for review" },
  { value: "NOTE", label: "Note", hint: "Reference material" },
  { value: "FLASHCARD", label: "Flashcard", hint: "Prompt → answer" },
];

export function ItemForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel?: () => void;
}) {
  const [type, setType] = useState<StudyItemType>("QUESTION");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isMcq = type === "QUESTION";

  const setOption = (i: number, value: string) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  };

  const handleSave = async () => {
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError(isMcq ? "Please enter the question." : "Please enter a title.");
      return;
    }

    if (isMcq) {
      const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
      if (cleanOptions.length < 2) {
        setError("A question needs at least two non-empty options.");
        return;
      }
      if (correctIndex === null || correctIndex >= cleanOptions.length) {
        setError("Mark the correct answer.");
        return;
      }
      setSaving(true);
      try {
        saveItem({
          title: cleanTitle,
          content: content.trim() || undefined,
          type,
          options: cleanOptions,
          correctAnswerIndex: correctIndex,
        });
        reset();
        onCreated();
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      saveItem({
        title: cleanTitle,
        content: content.trim() || undefined,
        type,
      });
      reset();
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  function reset() {
    setTitle("");
    setContent("");
    setOptions(["", ""]);
    setCorrectIndex(null);
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Add study item</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {itemTypes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setType(t.value);
              setError(null);
            }}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left transition-colors",
              type === t.value
                ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <span className="block text-sm font-medium text-slate-900">{t.label}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{t.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        <Field label={isMcq ? "Question" : "Title"}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isMcq ? "What does the mitochondria do?" : "e.g. Photosynthesis key points"
            }
          />
        </Field>

        {isMcq ? (
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">
              Options
            </legend>
            <div className="flex flex-col gap-2">
              {options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectIndex(i)}
                    aria-label={`Mark option ${i + 1} as correct`}
                    aria-pressed={correctIndex === i}
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                      correctIndex === i
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-200 bg-white text-slate-400 hover:border-slate-300",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <Input
                    value={option}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setOptions((prev) => prev.filter((_, idx) => idx !== i));
                        setCorrectIndex(null);
                      }}
                      aria-label={`Remove option ${i + 1}`}
                      className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button
                type="button"
                onClick={() => setOptions((prev) => [...prev, ""])}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus className="size-3.5" /> Add option
              </button>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Tap a letter to mark the correct answer.
            </p>
          </fieldset>
        ) : (
          <Field label="Content" hint="Optional details or the answer.">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Write it down…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-500"
            />
          </Field>
        )}

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} loading={saving}>
            Save item
          </Button>
        </div>
      </div>
    </Card>
  );
}
