"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  CloudUpload,
  FileText,
  KeyRound,
  Sparkles,
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
import { apiGet, apiPostForm, apiPostJson } from "@/lib/api";
import { isAuthed } from "@/lib/local-store";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,.docx";

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};

interface Analysis {
  extractedText: string;
  title: string;
  summary: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  keywords: string[];
}

interface UploadResponse {
  documentId: string;
  status: string;
  analysis: Analysis;
}

interface DocumentSummary {
  id: string;
  title: string | null;
  originalName: string;
  mimeType: string;
  status: string;
  createdAt: string;
}

type Step = "pick" | "uploading" | "analyzed" | "generating" | "generated";

export default function UploadPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [generated, setGenerated] = useState<number>(0);
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAuthed(isAuthed());
    if (isAuthed()) {
      apiGet<DocumentSummary[]>("/documents")
        .then(setDocuments)
        .catch(() => setDocuments([]));
    }
  }, []);

  const validate = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type as (typeof ACCEPTED_TYPES)[number])) {
      return "Unsupported file type. Use PDF, DOCX, PNG or JPG.";
    }
    if (f.size > MAX_FILE_SIZE) {
      return "File is too large (max 20 MB).";
    }
    return null;
  };

  const pickFile = useCallback((f: File) => {
    const problem = validate(f);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setFile(f);
    setAnalysis(null);
    setGenerated(0);
    setStep("pick");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) pickFile(f);
    },
    [pickFile],
  );

  const upload = async () => {
    if (!file) return;
    setError(null);
    setStep("uploading");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiPostForm<UploadResponse>("/documents", form);

      if (res.status === "FAILED") {
        throw new Error("AI analysis failed for this file. Try a different one.");
      }
      setDocumentId(res.documentId);
      setAnalysis(res.analysis);
      setStep("analyzed");
    } catch (e: any) {
      setError(e.message || "Upload failed. Please try again.");
      setStep("pick");
    }
  };

  const generateQuestions = async () => {
    if (!documentId) return;
    setError(null);
    setStep("generating");
    try {
      const items = await apiPostJson<unknown[]>(
        `/documents/${documentId}/questions`,
      );
      setGenerated(items.length ?? 0);
      setStep("generated");
    } catch (e: any) {
      setError(e.message || "Question generation failed.");
      setStep("analyzed");
    }
  };

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setDocumentId(null);
    setGenerated(0);
    setStep("pick");
    setError(null);
    if (authed) {
      apiGet<DocumentSummary[]>("/documents")
        .then(setDocuments)
        .catch(() => setDocuments([]));
    }
  };

  /* ------------------------------ Guest gate ------------------------------ */

  if (authed === null) {
    return (
      <AppShell>
        <div className="flex justify-center py-32">
          <Spinner className="size-6 text-brand-600" />
        </div>
      </AppShell>
    );
  }

  if (!authed) {
    return (
      <AppShell>
        <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <KeyRound className="size-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Uploading needs an account
          </h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Document upload and AI question generation run on our servers, so
            they require a free account. Guest mode still supports manually
            added questions.
          </p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <ButtonLink href="/register">Create a free account</ButtonLink>
            <ButtonLink href="/login" variant="outline">
              Log in
            </ButtonLink>
          </div>
        </main>
      </AppShell>
    );
  }

  /* ------------------------------- Screens ------------------------------- */

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Upload study material
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            PDF, DOCX or an image. AI reads it, then generates MCQs that feed
            your revision schedule.
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-5">
            {error}
          </Alert>
        )}

        {step === "generated" ? (
          /* --------------------------- Success --------------------------- */
          <Card className="flex flex-col items-center p-10 text-center">
            <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CircleCheck className="size-7" />
            </span>
            <h2 className="text-xl font-semibold text-slate-900">
              {generated > 0
                ? `${generated} ${generated === 1 ? "question" : "questions"} created`
                : "Document processed"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {generated > 0
                ? "They enter your schedule with a first review 24 hours from now."
                : "No questions could be generated from this material."}
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              {generated > 0 && (
                <ButtonLink href="/dashboard">
                  Back to dashboard
                  <ArrowRight className="size-4" />
                </ButtonLink>
              )}
              <Button variant="outline" onClick={reset}>
                Upload another file
              </Button>
            </div>
          </Card>
        ) : step === "analyzed" || step === "generating" ? (
          /* --------------------------- Analysis --------------------------- */
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FileText className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">
                    {analysis?.title || file?.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {file && MIME_LABELS[file.type]} · analyzed
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                aria-label="Discard"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            {analysis && (
              <>
                <p className="mt-5 text-sm leading-relaxed text-slate-600">
                  {analysis.summary}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[analysis.subject, analysis.chapter, analysis.topic].map(
                    (label, i) =>
                      label ? (
                        <span
                          key={i}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                        >
                          {label}
                        </span>
                      ) : null,
                  )}
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {analysis.difficulty}
                  </span>
                </div>

                {analysis.keywords.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Keywords
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {analysis.keywords.slice(0, 12).map((k) => (
                        <span
                          key={k}
                          className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-500"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-8 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
              <Button
                onClick={generateQuestions}
                loading={step === "generating"}
              >
                <Sparkles className="size-4" />
                Generate questions
              </Button>
            </div>

            <p className="mt-3 text-right text-xs text-slate-400">
              Generation can take a minute for long documents.
            </p>
          </Card>
        ) : (
          /* --------------------------- Dropzone --------------------------- */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
              dragging
                ? "border-brand-500 bg-brand-50"
                : "border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50",
              step === "uploading" && "pointer-events-none opacity-70",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTR}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pickFile(f);
                e.target.value = "";
              }}
            />

            {step === "uploading" ? (
              <>
                <Spinner className="mb-4 size-8 text-brand-600" />
                <p className="font-medium text-slate-900">
                  Uploading & analyzing…
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  AI is reading your material — usually under a minute.
                </p>
              </>
            ) : (
              <>
                <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <CloudUpload className="size-7" />
                </span>
                {file ? (
                  <>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB ·{" "}
                      {MIME_LABELS[file.type] ?? file.type}
                    </p>
                    <div className="mt-5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" onClick={() => setFile(null)}>
                        Choose another
                      </Button>
                      <Button onClick={upload}>
                        Upload & analyze
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-900">
                      Drag & drop your file here
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      or click to browse — PDF, DOCX, PNG, JPG (max 20 MB)
                    </p>
                    <Button className="mt-5" variant="outline">
                      Browse files
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Recent documents */}
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <BookOpen className="size-4" />
            Your documents
          </h2>
          {documents === null ? (
            <div className="flex justify-center py-6">
              <Spinner className="size-5 text-slate-400" />
            </div>
          ) : documents.length === 0 ? (
            <Card className="px-5 py-8 text-center text-sm text-slate-500">
              No documents yet — your uploads will appear here.
            </Card>
          ) : (
            <Card className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {doc.title || doc.originalName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {MIME_LABELS[doc.mimeType] ?? doc.mimeType} ·{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </Card>
          )}
        </section>
      </main>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    READY: { label: "Ready", className: "bg-emerald-100 text-emerald-700" },
    UPLOADED: { label: "Uploaded", className: "bg-slate-100 text-slate-600" },
    ANALYZING: { label: "Analyzing", className: "bg-amber-100 text-amber-700" },
    FAILED: { label: "Failed", className: "bg-red-100 text-red-600" },
  };
  const meta = map[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
