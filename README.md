# Ready-To-Revise (Revision Scheduler App)

Ready-To-Revise is an intelligent study companion that helps you remember what you learn using behavior-driven spaced repetition. Upload study materials (PDFs, DOCX, or images), get AI-generated MCQs, and revise them with a smart scheduler that adapts based on how you actually perform — not just self-reported ratings.

## 🌐 Live Website

**[https://revision-scheduler-app.onrender.com](https://revision-scheduler-app.onrender.com)**

No signup required to try it — the web app works in guest mode out of the box. Create a free account whenever you want to sync your items across devices.

## Features

- **🌐 Web App**: Next.js web client with the full revision flow — upload documents for AI questions, run revision sessions, and track progress with an analytics dashboard (works with or without an account: guest mode stores everything on your device and migrates your data when you sign up)
- **📄 Smart Material Ingestion**: Upload PDFs, `.docx`, PNG/JPG images; Gemini extracts and analyzes content to generate questions automatically
- **🧠 AI-Generated Questions**: Get high-quality multiple-choice questions tailored to your study materials
- **⏰ Behavior-Driven Spaced Repetition**: Scheduler derives confidence from correctness + passive telemetry (time spent, interactions) — no manual difficulty ratings
- **🎯 Personalized Recommendations**: ML-powered recall predictions suggest what to revise next, with graceful fallback to scheduler order
- **📱 Android App**: Native Kotlin/Jetpack Compose app with offline-capable revision sessions and reminder notifications
- **📊 Analytics Dashboard**: Track your study progress with activity heatmaps and insights
- **🔐 Secure Auth**: JWT-based authentication with password reset via OTP (email)
- **☁️ Flexible Storage**: Support for local filesystem or S3-compatible object storage (Tigris, Cloudflare R2, Backblaze B2)

## Architecture

This is a full-stack monorepo with four main components:

| Component | Tech Stack | Purpose |
|-----------|------------|---------|
| **[Web App](./web)** | Next.js 16, React 19, Tailwind CSS v4 | Web client: landing page, auth, dashboard, revision sessions, guest mode |
| **[Backend](./backend/README.md)** | NestJS 11, TypeScript, Prisma, PostgreSQL | REST API (`/api/v1`), auth, document processing, spaced repetition logic, ML integration |
| **[Android App](./android/README.md)** | Kotlin, Jetpack Compose, Retrofit, WorkManager | Mobile client for studying on the go |
| **[ML Service](./machine_learning/README.md)** | FastAPI, Python, scikit-learn/pandas | Recall prediction model training and inference |

## Prerequisites

### For Docker-based setup (Recommended)
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

### For local development
- **Backend**: [Node.js 20+](https://nodejs.org/), [npm](https://www.npmjs.com/), [PostgreSQL 17](https://www.postgresql.org/)
- **ML Service**: [Python 3.11+](https://www.python.org/), [uv](https://docs.astral.sh/uv/) or pip
- **Android**: [Android Studio](https://developer.android.com/studio), [JDK 17](https://adoptium.net/)

### API Keys Required
- [Google Gemini API Key](https://aistudio.google.com/apikey) - for document analysis and question generation
- Email provider (optional): [Gmail App Password](https://support.google.com/accounts/answer/185833) or [Brevo API Key](https://www.brevo.com/) for password reset OTPs

## Quick Start (Docker Compose)

The easiest way to run the entire stack locally:

### 1. Clone the repository
```bash
git clone https://github.com/nehalss267/Ready-to-Revise-website.git
cd Ready-to-Revise-website
```

### 2. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
POSTGRES_USER=r2r_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=r2r_db

JWT_SECRET=your-super-secret-jwt-key-change-this
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:3000,http://10.0.2.2:3000

# Optional: Email for password reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM=your_email@gmail.com
```

### 3. Start all services
```bash
docker compose up -d
```

This will start:
- **Postgres** on `localhost:5433`
- **ML Service** on `http://localhost:8000` (internal) / accessible via backend
- **Backend API** on `http://localhost:3000`

### 4. Run database migrations
```bash
cd backend
npx prisma migrate deploy
```

### 5. Access the services
- **Backend API Docs (Swagger)**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Backend Health**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
- **ML Service Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Manual Setup (Local Development)

### Backend (NestJS)

```bash
cd backend

# Install dependencies
npm ci

# Configure environment
cp .env.example .env
# Edit .env with DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, etc.

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Start development server
npm run start:dev
```

API will be available at `http://localhost:3000` with Swagger at `http://localhost:3000/api/docs`.

### ML Service (FastAPI)

```bash
cd machine_learning

# Install dependencies (using uv recommended)
uv sync
# or: pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit with database credentials

# Train model (if needed)
python train.py

# Start service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

ML service docs at `http://localhost:8000/docs`.

### Android App

```bash
cd android

# Configure backend URL
echo "sdk.dir=/path/to/android/sdk" > local.properties
echo "BACKEND_URL=http://10.0.2.2:3000/" >> local.properties  # For emulator
# Or use your local IP for physical device

# Build and install
./gradlew assembleDebug
./gradlew installDebug
```

Open in Android Studio for the best development experience.

### Web App (Next.js)

```bash
cd web

# Install dependencies
npm ci

# Configure environment
cp .env.example .env.local
# Point it at your backend API (default works with local backend):
# NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Start development server
npm run dev
```

Web app will be available at `http://localhost:3001`. Production build: `npm run build && npm start` (also port 3001).

> The web app needs the backend running (or set `NEXT_PUBLIC_API_URL` to a deployed backend). Guest mode works fully offline with no backend at all.

## Using the Web App

### Without an account (Guest mode)
1. Open the site and click **Try as guest** — no signup needed
2. On the dashboard, click **Add item** to create questions (MCQ with 2–6 options), notes, or flashcards
3. Click **Start revision** to run a revision session:
   - MCQs: pick an answer and **Check answer** — a per-question timer feeds the confidence model
   - Flashcards: try to recall, then **Reveal answer** and grade yourself (**Again** / **Got it**)
   - Notes/other cards: read through and mark **Memorized** or **Skip**
   - Keyboard shortcuts: **A–D / 1–6** pick an option, **Enter** check/reveal/next, **M** memorize, **Esc** pause
   - The session clock can be paused any time (Esc)
4. The session summary lists every card with your answer, the correct answer, and its grade
5. Your progress, streak, and schedule are stored in your browser (localStorage) — the same spaced-repetition rules as the backend apply
6. Note: AI document upload requires an account (it runs on the server) — see below

### With an account
1. Click **Sign up** (email + password) — your guest items are automatically imported into your account
2. Use the **Upload** page to send PDF/DOCX/image study material; AI analyzes it (title, summary, subject, keywords) and generates MCQs from it
3. Log in anytime; your schedule syncs across devices
4. Password reset via email OTP is available from the login screen

### Analytics
The **Analytics** page shows reviews per day, accuracy, current/longest streaks, today's completion rate, a per-subject breakdown, your 10 most recent reviews, and a GitHub-style activity heatmap for the past year. Toggle between 7-day and 30-day ranges. In guest mode it works on local data; when signed in it reads from the analytics API.

### Settings
The **Settings** page manages your account and data: change your password (signed-in users), export your local guest data as JSON, or clear everything stored in the browser. Guest items not yet imported are carried into your account on the next login.

### How scheduling works (both modes)
- Wrong answers → review again in **1 day**
- Correct answers → interval grows from **3 / 7 / 14 days** depending on how fast and confidently you answer
- Correct intervals expand **1.2×–2.6×** per review, capped at 365 days
- **Memorized** items get the GOOD interval × 1.5

## How It Works

### Spaced Repetition Logic
The app uses behavior-driven scheduling:
- **No self-reporting**: Clients never send "correct/incorrect" or confidence ratings — the backend derives them from answer selection and passive telemetry
- **Initial Intervals**: AGAIN=1 day, HARD=3 days, GOOD=7 days, EASY=14 days
- **Multipliers**: AGAIN (1.2x), HARD (1.9x), GOOD (2.6x), capped at 365 days
- **Swipe "Memorized"**: Self-grading gives baseline GOOD interval × 1.5 multiplier (compounds on repeated memorization)
- **First revision**: Generated questions get +24h stamp on creation

### Upload & Processing Pipeline
1. User uploads PDF/DOCX/image via the web app (Upload page) or Android app
2. Backend stores file (local or S3) and creates `Document` record
3. AI analyzes content using Gemini
4. Questions are generated and persisted as `StudyItem`s
5. Web generates questions on demand from the Upload page; Android polls for processing status via WorkManager

### Revision Flow
1. App fetches recommendations from `GET /api/v1/recommendations` (ML-powered, falls back to scheduler)
2. User answers MCQs in revision session
3. On completion, app batch-sends raw observables to `POST /api/v1/reviews`
4. Backend derives results/confidence and updates scheduling
5. Swipe-left on card can trigger instant `POST /api/v1/reviews/self-grade` for "memorized"

## API Overview

Base URL: `http://localhost:3000/api/v1` | Swagger: `/api/docs`

Key endpoints:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register`, `/auth/login` | POST | Authentication |
| `/documents` | POST/GET | Upload and list study materials |
| `/documents/{id}/questions` | POST | Generate questions from document |
| `/recommendations` | GET | Get items due for review (ML-ranked) |
| `/reviews` | POST | Submit review session (raw observables) |
| `/reviews/self-grade` | POST | Swipe "memorized" action |
| `/dashboard` | GET | Study stats and suggestions |
| `/analytics/overview`, `/analytics/heatmap` | GET | Progress analytics |

## Testing

```bash
# Web client
cd web
npm run typecheck   # TypeScript
npm run build       # Production build

# Backend
cd backend
npm test           # Unit tests
npm run test:e2e   # E2E tests (requires DATABASE_URL)

# ML Service
cd machine_learning
pytest

# End-to-end flow test (from repo root)
./scripts/e2e.sh
```

## Deployment

- **Web App**: Live at [https://revision-scheduler-app.onrender.com](https://revision-scheduler-app.onrender.com) — deployed on [Render](https://render.com/) (see `web/render.yaml`; set `NEXT_PUBLIC_API_URL` to your backend URL)
- **Backend**: Ready for deployment on [Render](https://render.com/) (see root `render.yaml`, reference-only — deploy via the Render dashboard). Uses Brevo for emails on Render.
- **ML Service**: Can be deployed separately (see `machine_learning/render.yaml`)
- **Android**: Build release APK/AAB with `./gradlew assembleRelease` / `bundleRelease`

For production, ensure:
- Set `DEBUG=false` / `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database (PostgreSQL)
- Set up proper `CORS_ORIGIN`
- Use S3-compatible storage for scalability
- Configure email provider (Brevo recommended for cloud hosts)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes.

## Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/nehalss267/Ready-to-Revise-website/issues).
