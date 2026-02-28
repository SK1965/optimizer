# Optimizer

A full-stack AI-powered code analysis engine that automatically measures the empirical time complexity of your algorithms. Submit code, and the platform compiles, executes it against three input sizes (small, medium, large) in an isolated sandbox, and uses an LLM to produce a definitive Big-O complexity estimate with a detailed explanation.

---

## Architecture Overview

```
optimizer/
├── frontend/          # Next.js application (UI + localStorage history)
├── backend/           # Express + TypeScript API server
│   ├── src/
│   │   ├── controllers/      # HTTP request handlers
│   │   ├── services/         # Business logic (worker, sandbox, LLM, boilerplate)
│   │   ├── routes/           # Express routes + sandbox runner
│   │   ├── prompts/          # Language-specific LLM prompt templates
│   │   ├── utils/            # Timing parser + complexity estimator
│   │   └── scripts/          # DB migration scripts
│   └── Dockerfile
└── SandBox/           # Isolated runtime environment for code execution
```

### Key Flow

```
User Submits Code
        ↓
POST /api/submit  →  DB (submissions table, status=processing)
        ↓
Worker Service (async)
        ↓
AI Boilerplate Service (Gemma 3)
  → Wraps user code with timing harness for 3 input sizes
        ↓
Sandbox Runner (Docker)
  → Compiles + executes wrapped code in isolation
        ↓
Timing Parser  →  Complexity Estimator (ratio analysis)
        ↓
LLM Service (Gemma 3)
  → Generates natural language explanation
        ↓
DB Update  →  status=completed, timings, Big-O, AI explanation
        ↓
Frontend polling  →  Displays ResultPanel
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 5, TypeScript |
| LLM | Google Gemma 3 27B (`gemma-3-27b-it`) via `@google/genai` |
| Database | PostgreSQL |
| Sandbox | Docker (isolated execution per submission) |
| Deployment | Fly.io (backend), local Docker (sandbox) |

---

## Getting Started

### Prerequisites

- Node.js v20+
- Docker Desktop running locally
- PostgreSQL database (local or hosted, e.g. Supabase)
- A Google AI Studio API key → [Get one here](https://ai.google.dev)

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
GEMINI_API_KEY=your_google_ai_key
PORT=3000
```

Run the dev server:

```bash
npm run dev
```

Build & start production:

```bash
npm run build
npm start
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend reads the backend URL from the env variable:

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

### Database Schema

Run this migration on your Postgres instance to set up the `submissions` table:

```sql
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  mode VARCHAR(50) DEFAULT 'complexity',
  input TEXT,
  status VARCHAR(20) DEFAULT 'processing',
  output TEXT,
  error_message TEXT,
  complexity VARCHAR(50),
  execution_time_small FLOAT,
  execution_time_medium FLOAT,
  execution_time_large FLOAT,
  estimated_complexity VARCHAR(100),
  ai_explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Reference

### Submit Code

```
POST /api/submit
Content-Type: application/json

{
  "code": "...",
  "language": "python" | "javascript" | "cpp" | "c" | "java"
}
```

**Response:**
```json
{ "submissionId": "uuid", "message": "Submission created successfully" }
```

---

### Get Submission Status

```
GET /api/submission/:id
```

**Response:**
```json
{
  "id": "uuid",
  "code": "...",
  "language": "python",
  "status": "completed",
  "estimated_complexity": "O(n^2)",
  "ai_explanation": "...",
  "execution_time_small": 12.4,
  "execution_time_medium": 49.2,
  "execution_time_large": 197.1,
  "created_at": "2026-02-28T..."
}
```

---

### Bulk Fetch Submissions

```
POST /api/submissions/bulk
Content-Type: application/json

{
  "submission_ids": ["uuid1", "uuid2", "..."]
}
```

**Response:** Array of submission objects (without full code/output).

---

## Supported Languages

| Language | Boilerplate Template |
|---|---|
| Python | `Python_code_implementation.prompt.ts` |
| JavaScript (Node.js) | `Node_code_implementation.prompt.ts` |
| C++ | `CPP_code_implementation.prompt.ts` |
| C | `C_code_implementation.prompt.ts` |
| Java | `Java_code_implementation.prompt.ts` |

---

## How Complexity Analysis Works

1. **Instrumentation:** The user's function is wrapped by the LLM in a timing harness that runs it with three inputs: `n = 10`, `n = 100`, `n = 1000`.
2. **Execution:** The instrumented code is compiled and executed in an isolated Docker sandbox. Raw timing output (in milliseconds) is captured from stdout.
3. **Ratio Analysis:** The timing ratios between input sizes are calculated (e.g., `T(100) / T(10)`) and compared against known Big-O doubling patterns:
   - `O(1)` → ratio ≈ 1
   - `O(log n)` → ratio ≈ 1.15
   - `O(n)` → ratio ≈ 10
   - `O(n log n)` → ratio ≈ 11.5
   - `O(n²)` → ratio ≈ 100
   - `O(2^n)` → ratio >> 100
4. **LLM Explanation:** The timing data alongside the original code and estimated Big-O is sent to Gemma 3 to generate a structured JSON explanation with step-by-step analysis.

---

## Deployment (Fly.io)

The backend is configured to deploy to Fly.io using [`backend/fly.toml`](./backend/fly.toml).

```bash
# Authenticate
fly auth login

# Deploy
cd backend
fly deploy --app optimizer-backend

# Set environment secrets
fly secrets set DATABASE_URL=your_postgres_url GEMINI_API_KEY=your_key
```

---

## Project Structure (Frontend)

```
frontend/src/
├── app/
│   ├── page.tsx            # Homepage — submission history dashboard
│   └── editor/
│       └── page.tsx        # Code editor + result panel
├── components/
│   ├── Header.tsx          # Top navigation bar
│   ├── EditorPanel.tsx     # Monaco-based code editor
│   ├── ResultPanel.tsx     # Execution results display
│   └── SubmissionCard.tsx  # History table row component
└── lib/
    ├── api.ts              # All backend API calls (axios)
    ├── storage.ts          # localStorage utility (history array)
    └── constants.ts        # Language defaults, supported languages
```

---

## License

MIT
