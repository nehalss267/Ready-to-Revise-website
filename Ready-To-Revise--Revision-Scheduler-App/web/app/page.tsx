export const metadata = {
  title: "Ready-To-Revise",
  description: "Behavior-driven spaced repetition revision scheduler",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-deep via-brand-deep to-brand-light p-4">
      <header className="max-w-7xl mx-auto pb-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold brand-text">Ready-To-Revise</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted hover:text-foreground transition-colors">How it works</a>
            <a href="/login" className="text-brand hover:text-white transition-colors">Log in</a>
          </nav>
        </div>

        <section className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            Remember more.<br />
            Revise smarter.
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8">
            Behavior-driven spaced repetition that adapts based on how you actually perform —
            not just self-reported ratings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="rounded-btn button-primary px-6 py-3 text-lg font-medium">
              Get Started
            </a>
            <a href="#features" className="rounded-border border-border px-6 py-3 text-lg text-muted hover:text-foreground transition-colors">
              Learn More
            </a>
          </div>
        </section>
      </header>

      <main className="max-w-7xl mx-auto">
        <section id="features" className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-2xl border border-border shadow-soft hover:bg-brand/5 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v20M2 12h20M4.93 4.93l2.83 2.83a1 1 0 0 1 1.42 0l2.83-2.83a1 1 0 0 1 1.42 1.42L18.66 10.08a1 1 0 0 1 0 1.42L9.18 16.56a1 1 0 0 1-1.42 0l-2.83 2.83a1 1 0 0 1-1.42-1.42L4.93 8.66a1 1 0 0 1 0-1.42z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">AI-Generated Questions</h3>
              <p className="text-sm text-muted">
                Upload study materials and get high-quality multiple-choice questions tailored to your content.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-border shadow-soft hover:bg-brand/5 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22c1.1 0 2.2-.1 3.3-.3L19 19l-5-5h2c.6 0 1.2.1 1.7.3l3.5 3.5c.4-.1.7-.2.9-.3L22 12l-5-5c-.4-.1-1-.2-1.6-.7l-4.5 4.5c-.1.4-.2.8-.3 1.2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Behavior-Driven Scheduler</h3>
              <p className="text-sm text-muted">
                No manual difficulty ratings — confidence derived from answer selection and passive telemetry.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-border shadow-soft hover:bg-brand/5 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8M12 8v8" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Personalized Recommendations</h3>
              <p className="text-sm text-muted">
                ML-powered recall predictions suggest what to revise next, with graceful fallback to scheduler order.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-20 bg-surface/50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 rounded-2xl border border-border shadow-soft text-center">
              <div className="h-14 w-14 rounded-xl bg-brand/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-7 w-7 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2v20M2 12h20M4.93 4.93l2.83 2.83a1 1 0 0 1 1.42 0l2.83-2.83a1 1 0 0 1 1.42 1.42L18.66 10.08a1 1 0 0 1 0 1.42L9.18 16.56a1 1 0 0 1-1.42 0l-2.83 2.83a1 1 0 0 1-1.42-1.42L4.93 8.66a1 1 0 0 1 0-1.42z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Upload Materials</h3>
              <p className="text-sm text-muted">
                PDF, DOCX, PNG, JPG — AI extracts and analyzes content automatically.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-border shadow-soft text-center">
              <div className="h-14 w-14 rounded-xl bg-success/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-7 w-7 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22c1.1 0 2.2-.1 3.3-.3L19 19l-5-5h2c.6 0 1.2.1 1.7.3l3.5 3.5c.4-.1.7-.2.9-.3L22 12l-5-5c-.4-.1-1-.2-1.6-.7l-4.5 4.5c-.1.4-.2.8-.3 1.2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Revise with MCQs</h3>
              <p className="text-sm text-muted">
                Answer multiple-choice questions in smart sessions, adaptively scheduled.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-border shadow-soft text-center">
              <div className="h-14 w-14 rounded-xl bg-brand/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-7 w-7 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8M12 8v8" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Track Your Progress</h3>
              <p className="text-sm text-muted">
                Heatmaps, streaks, subject insights, and recall predictions.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="border-t border-border pt-16">
              <blockquote className="text-lg md:text-xl font-medium text-foreground/90 mb-4">
                "The smartest way to revise what you've learned."
              </blockquote>
              <cite className="text-sm text-muted/80">— Ready-To-Revise users</cite>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-8">
              <div>
                <h3 className="text-xl font-medium mb-2">Platforms</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Android App — Native Kotlin/Jetpack Compose</li>
                  <li>Web Client — Coming Soon</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Resources</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>Documentation</li>
                  <li>API Reference</li>
                  <li>GitHub</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 bg-surface text-muted py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h4 className="font-medium mb-3">Ready-To-Revise</h4>
            <p className="text-sm">
              An intelligent study companion using behavior-driven spaced repetition.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row justify-between align-center">
          <p className="text-xs copyright">© 2026 Ready-To-Revise. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" aria-label="GitHub" className="hover:text-foreground transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 7.36 8.207 5.801.599.084.842.022.846-.022.67-.586 1.44-1.1 1.44-2.305 0-1.369-.705-1.996-1.433-2.305-1.063-.906-2.51-1.463-4.38-1.463-2.91 0-5.167 1.605-5.167 3.573 0 1.887.658 3.534 1.709 4.388-.339.327-.705.69-1.037.945-1.173-.53-1.395-1.082-1.395-1.082-.516-1.037-.283-1.278.409-1.613.702.086.635.16.68.157.097.007.192.014.263.088l1.997 1.533c.486.37.707.84.707 1.378v1.166c0 .532-.013 1.063-.05 1.593l.043.262.078.613c.418.326.871.68 1.141.993.27.316.528.66.674.973.364.772.56 1.557.56 2.396v1.166c0 .532.013 1.063.05 1.593l.042.262.079.613c.268.182.502.346.672.443.381.17.67.28 1.032.28 1.465 0 2.067-.063 2.414-.318l1.533-1.997c.117-.098.158-.17.123-.293l-1.936-1.486c-.308-.438-.669-.89-.968-1.156-.456-.378-.78-.82-.968-1.156l-1.316-1.617c-.066-.081-.076-.108-.011-.189.055-.08.138-.16.123-.287l1.996-1.533c.088-.067.153-.115.182-.223.056-.167.006-.357-.027-.477z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-foreground transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.27 8.502 3.787-5.188 5.018-3.982-1.485-8.565-4.836 5.618-5.785-8.675 4.244-5.387-1.885-8.562-4.819 5.665-5.752-8.599 4.242 5.689 5.772-8.652 4.238-5.377-1.877zM7.57 11.853l-1.824 3.647c-.118.236-.261.401-.388.497-.217.141-.407.23-.607.23-.274 0-.489-.13-.647-.347l-1.824-3.647c-.117-.235-.165-.508-.117-.74.048-.232.263-.408.497-.388l1.825-3.646c.121-.243.332-.416.598-.416.342 0 .519.23.608.488l1.824 3.647c.12.243.172.508.117.74 0 .232-.264.407-.498.388L7.57 11.853z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}