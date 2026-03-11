#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-dev}"

# ── Shared: ensure backend venv ───────────────────────────────────────────────
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment…"
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

# ── Dev mode: two servers ─────────────────────────────────────────────────────
if [ "$MODE" = "dev" ]; then
  echo "Starting dev servers…"

  DEV=1 uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
  BACKEND_PID=$!

  cd "$ROOT/frontend"
  pnpm dev &
  FRONTEND_PID=$!

  trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM

  echo ""
  echo "  Backend  → http://localhost:8000"
  echo "  Frontend → http://localhost:3000  (open this)"
  echo ""
  echo "Press Ctrl+C to stop."
  wait

# ── Prod mode: build frontend, then one server ────────────────────────────────
elif [ "$MODE" = "prod" ]; then
  echo "Building Next.js static export…"
  cd "$ROOT/frontend"
  pnpm build             # outputs to frontend/out/

  echo ""
  echo "Starting production server on http://0.0.0.0:8000 …"
  cd "$ROOT/backend"
  exec uvicorn main:app --host 0.0.0.0 --port 8000

else
  echo "Usage: $0 [dev|prod]"
  exit 1
fi
