# img2webp — Project Guide for Claude

## Project Overview

Privacy-first image-to-WebP converter. Users drag-drop images, choose quality/resize options, and download converted `.webp` files. **Nothing is stored on the server.**

**Stack:**
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript (strict)
- **Backend (dev):** Python FastAPI — serves `/api/convert`, proxied from Next.js on `localhost:8000`
- **Backend (prod):** Firebase Cloud Functions (Flask) — handles `/api/**` rewrites
- **Hosting:** Firebase Hosting with static export from Next.js (`frontend/out/`)

---

## Project Structure

```
img2webp/
├── .husky/                    # Git hooks (pre-commit)
├── .github/workflows/         # CI/CD — deploys to Firebase on push to main
├── backend/                   # FastAPI dev server
│   ├── main.py                # POST /api/convert endpoint
│   └── requirements.txt
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Geist fonts)
│   │   ├── page.tsx           # Main page — state, fetch, download logic
│   │   ├── globals.css        # Tailwind + theme variables
│   │   └── components/
│   │       ├── DropZone.tsx   # Drag-and-drop file input
│   │       ├── FileList.tsx   # File list with previews and remove
│   │       └── OptionsPanel.tsx  # Quality/resize controls, exports ConvertOptions
│   ├── eslint.config.mjs
│   ├── next.config.ts         # Static export + dev proxy to :8000
│   ├── tsconfig.json          # strict mode, path alias @/*
│   └── package.json
├── functions/                 # Firebase Cloud Functions
│   ├── main.py                # Flask HTTP handler — same logic as backend/main.py
│   └── requirements.txt
├── firebase.json              # Hosting + functions config
├── start.sh                   # Dev: starts both FastAPI + Next.js
└── convert.py                 # Legacy standalone CLI converter (unused)
```

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

API proxy: Next.js rewrites `/api/*` → `http://localhost:8000/api/*` in dev mode.

---

## File Separation Rules

Each file has a single responsibility. Follow this structure strictly:

| What | Where |
|------|-------|
| Page-level state, fetch calls, download logic | `app/page.tsx` |
| Reusable UI components | `app/components/<ComponentName>.tsx` |
| Shared TypeScript types/interfaces | `app/types/` (create if needed) |
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

**Current shared types to move to `app/types/` if they grow:**
- `ConvertOptions` (currently in `OptionsPanel.tsx`) — move to `app/types/convert.ts` when referenced from `page.tsx` or other components

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

```bash
# Deploy to Firebase (runs automatically on push to main via GitHub Actions)
firebase deploy --only hosting:img2webp-longcelot,functions

# Build frontend static export manually
cd frontend && pnpm build    # outputs to frontend/out/
```

**Important:** `next.config.ts` sets `output: "export"` and disables image optimization for Firebase Hosting compatibility. Do not remove these settings.

---

## Backend Notes (Python)

- Image conversion logic lives in both `backend/main.py` (FastAPI) and `functions/main.py` (Flask). Keep them in sync when modifying conversion logic.
- Pillow is the only image processing dependency — do not add alternatives.
- The `/api/convert` endpoint accepts `multipart/form-data` with files + `quality`, `do_resize`, `max_width`, `max_height` fields.
- Response is always a single `.webp` file or a `.zip` archive when multiple files are submitted.
