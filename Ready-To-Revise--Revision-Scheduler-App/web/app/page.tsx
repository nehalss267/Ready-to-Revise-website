export const metadata = {
  title: "Ready-To-Revise — Revise smarter, remember more",
};

function Check() {
  return (
    <svg className="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-deep via-brand-deep to-brand-light">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center text-white text-sm font-bold">R</span>
            <span className="text-lg font-bold text-white">Ready-To-Revise</span>
          </a>
          <nav className="flex items-center gap-4 md:gap-6 text-sm">
            <a href="#features" className="hidden sm:inline text-white/75 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hidden sm:inline text-white/75 hover:text-white transition-colors">How it works</a>
            <a href="/login" className="rounded-lg border border-white/25 px-4 py-1.5 text-white hover:bg-white/10 transition-colors">Log in</a>
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.35]" aria-hidden />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand/25 blur-3xl animate-float" aria-hidden />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-brand-light/20 blur-3xl animate-float" aria-hidden style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/85">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            Behavior-driven spaced repetition
          </span>
          <h1 className="animate-fade-up text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mt-6 text-balance" style={{ animationDelay: "0.1s" }}>
            Remember more.<br />
            <span className="brand-text" style={{ backgroundImage: "linear-gradient(120deg, #7dd3fc, #e1f5fe)" }}>Revise smarter.</span>
          </h1>
          <p className="animate-fade-up text-lg md:text-xl text-white/75 max-w-2xl mx-auto mt-6 text-balance" style={{ animationDelay: "0.2s" }}>
            No manual difficulty ratings. Ready-To-Revise learns from how you actually answer — and schedules each revision at the moment it matters most.
          </p>
          <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-center mt-10" style={{ animationDelay: "0.3s" }}>
            <a href="/register" className="rounded-xl bg-white px-7 py-3.5 text-lg font-semibold text-brand-deep shadow-soft transition-transform hover:scale-[1.03]">
              Get started free
            </a>
            <a href="#features" className="rounded-xl border border-white/30 px-7 py-3.5 text-lg font-medium text-white transition-colors hover:bg-white/10">
              See how it works
            </a>
          </div>

          {/* trust strip */}
          <ul className="animate-fade-up flex flex-wrap justify-center gap-x-8 gap-y-3 mt-14 text-sm text-white/70" style={{ animationDelay: "0.4s" }}>
            {["AI-generated MCQs", "Adaptive scheduling", "Recall analytics"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Light content ---------- */}
      <div className="rounded-t-[2.5rem] bg-background text-foreground">
        {/* features */}
        <section id="features" className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Built around how memory works</h2>
          <p className="text-muted text-center mt-3 max-w-xl mx-auto">Three pillars drive every revision decision the scheduler makes.</p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {[
              {
                tone: "text-brand bg-brand/10",
                title: "AI-generated questions",
                body: "Upload PDFs, DOCX or images and get multiple-choice questions tailored to your material — no manual writing.",
                icon: <path d="M12 2v20M2 12h20M4.93 4.93l2.83 2.83a1 1 0 0 1 1.42 0l2.83-2.83a1 1 0 0 1 1.42 1.42L18.66 10.08a1 1 0 0 1 0 1.42L9.18 16.56a1 1 0 0 1-1.42 0l-2.83 2.83a1 1 0 0 1-1.42-1.42L4.93 8.66a1 1 0 0 1 0-1.42z" />,
              },
              {
                tone: "text-success bg-success/10",
                title: "Behavior-driven scheduler",
                body: "Confidence is derived from answer selection and passive telemetry — never from self-reported ratings.",
                icon: <path d="M12 22c1.1 0 2.2-.1 3.3-.3L19 19l-5-5h2c.6 0 1.2.1 1.7.3l3.5 3.5c.4-.1.7-.2.9-.3L22 12l-5-5c-.4-.1-1-.2-1.6-.7l-4.5 4.5c-.1.4-.2.8-.3 1.2z" />,
              },
              {
                tone: "text-warning bg-warning/10",
                title: "Recall predictions",
                body: "ML-powered predictions suggest what to revise next, with graceful fallback to scheduler order.",
                icon: <circle cx="12" cy="12" r="10" />,
                icon2: <path d="M8 12h8M12 8v8" />,
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-surface shadow-card p-7 transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-5 ${f.tone}`}>
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                    {f.icon2}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section id="how-it-works" className="bg-surface-2/60 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center">From material to mastery in three steps</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-12">
              {[
                { n: "01", title: "Upload materials", body: "PDF, DOCX, PNG, JPG — AI extracts and analyzes content automatically." },
                { n: "02", title: "Revise with MCQs", body: "Answer questions in smart sessions, adaptively scheduled around your performance." },
                { n: "03", title: "Track your progress", body: "Heatmaps, streaks, subject insights, and recall predictions keep you honest." },
              ].map((s) => (
                <div key={s.n} className="relative rounded-2xl border border-border bg-surface shadow-card p-7">
                  <span className="text-4xl font-extrabold brand-text">{s.n}</span>
                  <h3 className="text-lg font-semibold mt-4 mb-2">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="rounded-3xl brand-gradient px-8 py-14 text-center text-white shadow-soft">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">The smartest way to revise what you've learned.</h2>
            <p className="text-white/80 mt-3 max-w-lg mx-auto">Create a free account and run your first smart revision session in minutes.</p>
            <a href="/register" className="mt-8 inline-flex rounded-xl bg-white px-8 py-3.5 text-lg font-semibold text-brand-deep transition-transform hover:scale-[1.03]">
              Start revising free
            </a>
          </div>
        </section>

        {/* platforms + resources */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface shadow-card p-7">
              <h3 className="font-semibold mb-3">Platforms</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-center gap-2"><Check /> Android App — native Kotlin/Jetpack Compose</li>
                <li className="flex items-center gap-2"><Check /> Web client</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-surface shadow-card p-7">
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>Documentation</li>
                <li>API reference</li>
                <li>GitHub</li>
              </ul>
            </div>
          </div>
        </section>

        {/* footer */}
        <footer className="border-t border-border py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg brand-gradient flex items-center justify-center text-white text-xs font-bold">R</span>
                <span className="font-semibold">Ready-To-Revise</span>
              </div>
              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
                <a href="#" className="hover:text-foreground transition-colors">About</a>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              </nav>
              <div className="flex gap-3">
                <a href="#" aria-label="GitHub" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-foreground/30 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.16 1.18a11 11 0 0 1 5.76 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" /></svg>
                </a>
                <a href="#" aria-label="Twitter" className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-foreground/30 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" /></svg>
                </a>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-muted">© 2026 Ready-To-Revise. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
