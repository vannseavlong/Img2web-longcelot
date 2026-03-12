# img2webp — Project Guide for Claude

## Project Overview

Privacy-first image-to-WebP converter. Users drag-drop images, choose quality/resize options, and download converted `.webp` files. **Nothing is stored on the server.**

**Stack:**
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript (strict)
- **Backend:** Python FastAPI — hosted on **Render** (free tier), serves `/api/convert`
- **Frontend hosting:** Firebase Hosting — static export from Next.js (`frontend/out/`)
- **CI/CD:** GitHub Actions — builds frontend + deploys to Firebase on push to `main`

---

## Project Structure

```
img2webp/
├── .husky/                    # Git hooks (pre-commit via husky + lint-staged)
├── .github/workflows/
│   └── deploy.yml             # CI/CD — builds frontend + deploys to Firebase Hosting
├── backend/                   # FastAPI server (dev + Render production)
│   ├── main.py                # POST /api/convert endpoint
│   └── requirements.txt
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Geist fonts)
│   │   ├── page.tsx           # Main page — state, queue convert loop, download logic
│   │   ├── globals.css        # Tailwind + theme variables
│   │   ├── types/
│   │   │   └── convert.ts     # ConvertOptions, FileStatus, FileEntry
│   │   └── components/
│   │       ├── DropZone.tsx   # Drag-and-drop file input
│   │       ├── FileList.tsx   # File list with per-file status indicators and previews
│   │       └── OptionsPanel.tsx  # Quality/resize controls
│   ├── eslint.config.mjs
│   ├── next.config.ts         # Static export + dev proxy to :8000
│   ├── tsconfig.json          # strict mode, path alias @/*
│   └── package.json           # husky prepare, lint-staged config
├── render.yaml                # Render deploy config for the FastAPI backend
├── firebase.json              # Firebase Hosting config (no functions)
├── start.sh                   # Dev: starts both FastAPI + Next.js
└── convert.py                 # Legacy standalone CLI converter (unused)
```

---

## Architecture

```
Browser
  └── Firebase Hosting (static Next.js export)
        └── fetch NEXT_PUBLIC_API_URL/api/convert
              └── Render (FastAPI)
                    └── returns .webp bytes
```

- In **dev**: Next.js dev server proxies `/api/*` → `http://localhost:8000` (no env var needed).
- In **production**: `NEXT_PUBLIC_API_URL` is baked into the static build at CI time, pointing to the Render service URL (set as `RENDER_BACKEND_URL` GitHub secret).
- CORS on the backend is controlled by the `ALLOWED_ORIGIN` env var (set to the Firebase Hosting URL on Render).

---

## Development Setup

```bash
# Start both frontend and backend in dev mode
./start.sh

# Frontend only (port 3000)
cd frontend && pnpm dev

# Backend only (port 8000)
cd backend && uvicorn main:app --reload
```

API proxy: Next.js rewrites `/api/*` → `http://localhost:8000/api/*` in dev mode only.
No `NEXT_PUBLIC_API_URL` is needed locally — the empty string falls back to the relative proxy.

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | GitHub secret `RENDER_BACKEND_URL`, injected at build | Points the static frontend to the Render backend (e.g. `https://img2webp-backend.onrender.com`) |
| `ALLOWED_ORIGIN` | Render env var | CORS origin the backend accepts (e.g. `https://img2webp-longcelot.web.app`) |

---

## File Separation Rules

Each file has a single responsibility. Follow this structure strictly:

| What | Where |
|------|-------|
| Page-level state, queue convert loop, download logic | `app/page.tsx` |
| Reusable UI components | `app/components/<ComponentName>.tsx` |
| Shared TypeScript types/interfaces | `app/types/` |
| Global styles | `app/globals.css` |
| Next.js route config, rewrites | `next.config.ts` |
| TypeScript config | `tsconfig.json` |
| ESLint rules | `eslint.config.mjs` |

**Rules:**
- One component per file. File name matches the exported component name.
- Never define types inline inside component files if they are shared across more than one file — move them to `app/types/`.
- Never import from `page.tsx` into a component. Data flows down via props only.
- Keep components pure and presentation-focused. Side effects (fetch, download) belong in `page.tsx` or custom hooks.

---

## TypeScript Rules (Frontend)

**No `any`. No exceptions.**

| Forbidden | Use instead |
|-----------|-------------|
| `any` | Proper type or `unknown` with narrowing |
| Untyped function parameters | Explicit param types |
| Untyped state | `useState<Type>(...)` |
| Untyped `ref` | `useRef<Type>(null)` |
| Untyped `event` | `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent`, etc. |
| Implicit return types on exported functions | Explicit `: ReturnType` |

**Type definition rules:**
- All component props must have a named `interface` (not inline type literal): `interface DropZoneProps { ... }`
- All data shapes passed between components must be defined as interfaces in `app/types/`
- Use `type` for unions/aliases, `interface` for object shapes
- Prefer `readonly` on props interfaces where mutation is not intended
- Mark optional props explicitly with `?`

**Shared types live in `app/types/convert.ts`:**
- `ConvertOptions` — quality, resize options passed from `OptionsPanel` → `page.tsx`
- `FileStatus` — `"pending" | "converting" | "done" | "error"` per-file state
- `FileEntry` — `{ file: File; status: FileStatus; result?: Blob; error?: string }`

---

## Code Quality Rules

### General
- No commented-out code committed to the repo
- No `console.log` in production code — use proper error handling
- No unused variables, imports, or parameters
- Keep functions small and single-purpose
- Prefer explicit over implicit (types, returns, conditionals)

### React / Next.js
- Client components must start with `"use client"` — only add it when needed (event handlers, hooks, browser APIs)
- Never use `useEffect` to derive state — compute it inline or use `useMemo`
- Avoid prop drilling more than 2 levels — consider co-locating state or extracting a context
- Use `useCallback` for callbacks passed as props to avoid unnecessary re-renders
- Image elements must use Next.js `<Image>` component, not `<img>`
- Object URL previews (`URL.createObjectURL`) must use the `useEffect` + `setState` pattern with cleanup (`URL.revokeObjectURL`). Suppress `react-hooks/set-state-in-effect` with `// eslint-disable-next-line` for this specific case. Do NOT use lazy `useState` init for object URLs — React StrictMode will revoke the URL before it can be used.

### Styling
- Tailwind utility classes only — no inline `style` props except for dynamic values (e.g., `style={{ width: \`${pct}%\` }}`)
- No custom CSS files other than `globals.css`
- Keep class strings readable: break long className strings across lines with template literals or `clsx`

---

## Pre-commit Checklist (Automated)

The following run automatically on every `git commit` via husky + lint-staged:

- [ ] ESLint passes with zero warnings (`eslint --max-warnings 0`) on all staged `.ts/.tsx/.js/.jsx/.mjs` files

Run manually before committing:
```bash
cd frontend && pnpm lint        # ESLint on all files
cd frontend && pnpm build       # TypeScript type check + production build
```

---

## Manual Code Review Checklist

Before opening a PR or considering a feature complete:

### TypeScript
- [ ] Zero `any` types — everything explicitly typed
- [ ] All component props have a named `interface`
- [ ] Shared types are in `app/types/`, not inline in component files
- [ ] `useRef` and `useState` have explicit type parameters
- [ ] No implicit `any` from untyped external data — parse and validate API responses

### Components
- [ ] One component per file
- [ ] Component file name matches default export name
- [ ] No side effects (fetch, timers, storage) inside component render bodies
- [ ] `"use client"` only on components that actually need it
- [ ] All callbacks passed as props are wrapped in `useCallback`

### API / Data Flow
- [ ] API response shape is typed with an interface, not `any`
- [ ] Error states are handled and surfaced to the user
- [ ] No sensitive data logged or exposed

### General
- [ ] No commented-out code
- [ ] No unused imports
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

---

## Deployment

### Frontend (Firebase Hosting) — automatic on push to `main`
```bash
cd frontend && pnpm build    # outputs to frontend/out/
firebase deploy --only hosting:img2webp-longcelot
```

### Backend (Render) — automatic on push to `main` if connected to repo
See `render.yaml` at the repo root. Render builds and runs `backend/` using:
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**GitHub Secrets required:**

| Secret | Value |
|---|---|
| `FIREBASE_TOKEN` | Firebase CI token (`firebase login:ci`) |
| `RENDER_BACKEND_URL` | Full Render service URL, e.g. `https://img2webp-backend.onrender.com` |

**Important:** `next.config.ts` sets `output: "export"` and disables image optimization for Firebase Hosting compatibility. Do not remove these settings.

---

## Backend Notes (Python)

- Image conversion logic lives in `backend/main.py`. This is the single source of truth — the `functions/` directory is no longer used.
- Pillow is the only image processing dependency — do not add alternatives.
- The `/api/convert` endpoint accepts `multipart/form-data` with `files`, `quality`, `do_resize`, `max_width`, `max_height` fields.
- Response is a single `.webp` blob per request. The frontend sends one file per request and handles multi-file packaging client-side with `jszip`.
- CORS is always enabled; the allowed origin is set via the `ALLOWED_ORIGIN` env var (default: `http://localhost:3000`).
