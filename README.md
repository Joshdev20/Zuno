# Zuno

Learn the web by building it. Zuno is an interactive coding platform: short lessons, real
code, and checks that run in the browser in milliseconds.

Four tracks — HTML, CSS, JavaScript and Python — 27 lessons, 82 drills, 27 coding
exercises, 54 knowledge checks and 13 badges, all playable without an account.

Python is real: the exercises run in a CPython 3.12 interpreter (Pyodide, WebAssembly) on
a worker thread, so `print()`, lists and functions behave exactly as they do on the
command line. The other tracks run in a sandboxed iframe.

A lesson plays as a sequence of small steps rather than a page you scroll: explain, see an
example, write code and pass the checks, answer the knowledge checks, collect XP.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + TypeScript + Vite |
| Routing | React Router 7 (client-side, no page reloads) |
| Editor | CodeMirror 6 (loaded lazily, only on lesson and playground routes) |
| Code execution | Sandboxed `iframe` for HTML/CSS/JS; Pyodide in a Web Worker for Python |
| API | FastAPI (optional, curriculum + anonymous progress mirror) |
| Storage | `localStorage` (no database yet) |

## Project layout

```
frontend/            React app
  src/lib/           curriculum loader, progress store, badges, sandbox runner
  src/components/    design-system primitives, layout, lesson workspace, marketing
  src/pages/         Landing, Dashboard, TrackPage, LessonPage, Playground, Achievements
  src/styles/        tokens, base, landing, app, lesson CSS
shared/curriculum/   html.json · css.json · js.json — the single source of truth
api/                 FastAPI service (optional)
```

## Local development

```bash
cd frontend
npm install
npm run dev          # http://localhost:12000
```

The app runs without the API. To run the optional FastAPI service:

```bash
pip install -r api/requirements.txt
uvicorn api.index:app --reload --port 8000
```

Vite proxies `/api` to `http://127.0.0.1:8000` during development. Point the deployed
frontend at a hosted API with `VITE_API_URL`:

```bash
# frontend/.env.local
VITE_API_URL=https://zuno-api.example.com
```

Without it, progress stays local and nothing is sent over the network.

## How a lesson works

`/learn/:track/:lesson` renders a full-screen step player (`LessonRunner`). Steps are
derived from the lesson data, so new content needs no new UI:

1. **Intro** — level chips, the promise of the lesson, the objectives.
2. **Sections** — one idea per step. A paragraph stays with the code sample it introduces;
   a new paragraph starts a new step.
3. **Drills** — a short exercise after the explanation, one of six shapes: multiple
   choice, fill the blank, predict the output, order the lines, find the wrong line, or
   type a short answer. Wrong answers explain themselves.
4. **Practice** — the brief, the progressive hints and the live editor. Continue unlocks
   only after every check passes.
5. **Knowledge checks** — one question per step, immediate right/wrong feedback, the
   explanation on the correct answer, a retry on the wrong one.
6. **Complete** — XP banked, checks passed, questions answered, next lesson.

Lessons unlock in order inside a track: the next one opens when the previous one is
completed, so advanced material never lands before the basics it assumes.

The step index is saved in the progress record, so closing the tab mid-lesson and coming
back resumes on the same step.

Each lesson's exercise declares its own checks:

| Check | What it verifies |
| --- | --- |
| `dom` | Selector exists, optional text match |
| `style` | Computed/used style matches an expected value |
| `js` | Expression evaluates truthy inside the sandbox |
| `source` | Submitted code contains required text |
| `console` | The learner's code logged the expected value |
| `python` | Expression evaluates truthy in the Python namespace after the code runs |

Checks run inside the preview iframe (`src/lib/runner.ts`) and report back over
`postMessage`, so the learner's code never touches the host page. Results arrive in
milliseconds, which is what keeps the loop feeling instant.

Python checks run through `src/lib/python.ts`, which talks to `public/pyodide-worker.js`.
The learner's code executes in a fresh namespace per run, stdout and the source are
exposed to checks as `__zuno_out` and `__zuno_src`, and the worker is terminated if a run
exceeds eight seconds — an endless loop costs one click, not a frozen tab. The interpreter
and its standard library are copied from `node_modules/pyodide` into `public/pyodide/` by
`npm run build` (they are not committed), so nothing is fetched from a third-party CDN.

## Adding lessons

Lessons live in `shared/curriculum/*.json`. Append to a track's `lessons` array and the
app picks it up automatically: navigation, progress maths, track counts, search and the
XP totals are all derived. Every lesson needs `sections`, an `exercise` (kind, starter
code, solution, checks) and `quiz` entries.

## Deployment

The frontend is a static SPA and deploys to Vercel with the included `vercel.json`
(`installCommand` and `buildCommand` target `frontend/`, output is `frontend/dist`, all
paths rewrite to `index.html`).

```bash
vercel --prod
```

The API is a normal ASGI app; host it anywhere that runs Python (Render, Fly, Cloud Run)
from the repository root so it can read `shared/curriculum`:

```bash
uvicorn api.index:app --host 0.0.0.0 --port 8000
```

Set `ZUNO_ALLOWED_ORIGINS` to your frontend origin in production.

## Scripts

```bash
npm run dev        # dev server
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build
npm run preview    # preview the build
```
