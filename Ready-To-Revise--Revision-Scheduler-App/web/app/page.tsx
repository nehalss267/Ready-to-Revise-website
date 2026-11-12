import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CalendarClock,
  ChartColumn,
  FileText,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { Button, ButtonLink, Card, Logo } from "@/components/ui";

const features = [
  {
    icon: Upload,
    title: "Upload anything",
    body: "Drop in PDFs, DOCX files, or images — your study material becomes revisable in seconds.",
  },
  {
    icon: Sparkles,
    title: "AI-crafted questions",
    body: "Gemini reads your material and generates quality multiple-choice questions for you.",
  },
  {
    icon: CalendarClock,
    title: "Schedules itself",
    body: "Confidence is derived from how you actually answer — timing and behavior, not self-ratings.",
  },
  {
    icon: ChartColumn,
    title: "See your progress",
    body: "Activity heatmaps and analytics show exactly what's sticking and what needs work.",
  },
];

const steps = [
  {
    icon: FileText,
    step: "1",
    title: "Add your material",
    body: "Upload a PDF, document, or photo of your notes.",
  },
  {
    icon: Sparkles,
    step: "2",
    title: "Get your question bank",
    body: "AI turns the content into revision-ready MCQs.",
  },
  {
    icon: Target,
    step: "3",
    title: "Revise on schedule",
    body: "Right before you'd forget — powered by spaced repetition.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-slate-50/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:block"
            >
              Log in
            </Link>
            <ButtonLink href="/register" size="sm">
              Sign up
            </ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-200/60 via-brand-100/30 to-transparent blur-3xl"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Sparkles className="size-3.5" />
            Behavior-driven spaced repetition
          </span>

          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Remember what you study,{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              for good
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-slate-500">
            Upload your study materials, get AI-generated questions, and let a
            smart scheduler that learns from you decide what to revise next.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <ButtonLink size="lg" className="w-full sm:w-auto" href="/register">
              Start revising free
            </ButtonLink>
            <ButtonLink
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              href="/login"
            >
              Log in
            </ButtonLink>
          </div>

          {/* Hero preview */}
          <Card className="mt-16 w-full max-w-3xl p-6 text-left shadow-lift sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Brain className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Today&apos;s revision</p>
                  <p className="text-xs text-slate-500">3 items due · ~6 min</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                On track
              </span>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {[
                ["Chapter 4 — Neural Networks", "Due today", "bg-brand-500"],
                ["Photosynthesis basics", "Due today", "bg-amber-400"],
                ["Spanish verbs: pretérito", "Due today", "bg-rose-400"],
              ].map(([title, meta, dot]) => (
                <li key={title} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className={`size-2 rounded-full ${dot}`} />
                    <span className="text-sm text-slate-700">{title}</span>
                  </div>
                  <span className="text-xs text-slate-400">{meta}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Built around how memory actually works
          </h2>
          <p className="mt-3 text-slate-500">
            No manual difficulty ratings. No guesswork about when to review.
            Just upload, revise, and let the schedule adapt to you.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-6 transition-shadow hover:shadow-lift">
              <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Three steps to lasting recall
            </h2>
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {steps.map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="relative text-center">
                <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-brand-600">
                  Step {step}
                </span>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Ready to revise?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Create a free account and never cram the night before again.
        </p>
        <div className="mt-8">
          <ButtonLink size="lg" href="/register">
            Create your free account
          </ButtonLink>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo className="text-base" />
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} ReadyToRevise. Built for learners.
          </p>
        </div>
      </footer>
    </div>
  );
}
