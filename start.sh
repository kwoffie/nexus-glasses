#!/usr/bin/env bash
# NEXUS Spectacle — start both backend (Express) and frontend (Vite dev).
# Handles the case where port 5000 is already taken by another app
# by falling back to 5001 and pointing VITE_API_URL at the backend port.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/server"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORT_CANDIDATES=(${BACKEND_PORT:-5000} 5001 5002 5003)
LOG_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/nexus-spectacle"
mkdir -p "$LOG_DIR"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

port_in_use() {
  local port="$1"
  (command -v ss >/dev/null && ss -tln 2>/dev/null | grep -qE "[:.]$port[[:space:]]") \
    || (command -v netstat >/dev/null && netstat -tln 2>/dev/null | grep -qE "[:.]$port[[:space:]]") \
    || python3 -c "import socket,sys; s=socket.socket(); s.settimeout(1); sys.exit(0 if s.connect_ex(('127.0.0.1',$port))==0 else 1)"
}

pick_backend_port() {
  for port in "${BACKEND_PORT_CANDIDATES[@]}"; do
    if port_in_use "$port"; then
      # Port is busy — but is it OUR backend already? Check the health endpoint.
      if curl -sf -m 2 "http://127.0.0.1:$port/api/health" 2>/dev/null | grep -q '"status":"OK"'; then
        echo "$port"
        return 0
      fi
      echo "Port $port is busy (not NEXUS), trying next..." >&2
      continue
    fi
    echo "$port"
    return 0
  done
  echo "ERROR: no free backend port among: ${BACKEND_PORT_CANDIDATES[*]}" >&2
  return 1
}

is_healthy() { curl -sf -m 2 "$1/api/health" >/dev/null 2>&1; }
is_frontend_up() { curl -sf -m 2 "http://127.0.0.1:$FRONTEND_PORT/" >/dev/null 2>&1; }

BACKEND_PORT="$(pick_backend_port)"
echo "==> NEXUS Spectacle launcher"
echo "    Project:  $SCRIPT_DIR"
echo "    Backend:  http://localhost:$BACKEND_PORT (log: $BACKEND_LOG)"
echo "    Frontend: http://localhost:$FRONTEND_PORT (log: $FRONTEND_LOG)"

# ---- install deps if missing ----
[ -d "$SCRIPT_DIR/node_modules" ] || { echo "==> npm install (frontend)..."; (cd "$SCRIPT_DIR" && npm install); }
[ -d "$BACKEND_DIR/node_modules" ] || { echo "==> npm install (backend)..."; (cd "$BACKEND_DIR" && npm install); }

# ---- backend ----
if is_healthy "http://127.0.0.1:$BACKEND_PORT"; then
  echo "==> Backend already healthy on :$BACKEND_PORT, reusing it."
else
  echo "==> Starting backend on :$BACKEND_PORT..."
  (cd "$BACKEND_DIR" && PORT="$BACKEND_PORT" nohup node index.js >"$BACKEND_LOG" 2>&1 < /dev/null & disown || true)
  for _ in $(seq 1 25); do
    sleep 0.4
    is_healthy "http://127.0.0.1:$BACKEND_PORT" && break
  done
  if is_healthy "http://127.0.0.1:$BACKEND_PORT"; then
    echo "==> Backend is up."
  else
    echo "ERROR: backend failed to start. Last log lines:" >&2
    tail -n 20 "$BACKEND_LOG" >&2 || true
    exit 1
  fi
fi

# ---- frontend ----
if is_frontend_up; then
  echo "==> Frontend already up on :$FRONTEND_PORT, reusing it."
else
  echo "==> Starting frontend (VITE_API_URL=http://localhost:$BACKEND_PORT)..."
  (cd "$SCRIPT_DIR" && VITE_API_URL="http://localhost:$BACKEND_PORT" nohup npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" >"$FRONTEND_LOG" 2>&1 < /dev/null & disown || true)
  for _ in $(seq 1 30); do
    sleep 0.5
    is_frontend_up && break
  done
  if is_frontend_up; then
    echo "==> Frontend is up."
  else
    echo "ERROR: frontend failed to start. Last log lines:" >&2
    tail -n 20 "$FRONTEND_LOG" >&2 || true
    exit 1
  fi
fi

FRONTEND_URL="http://localhost:$FRONTEND_PORT/"
echo ""
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  http://localhost:$BACKEND_PORT/api/health"
echo ""

# ---- open browser (skip with --no-browser) ----
if [[ "${1:-}" != "--no-browser" ]]; then
  if command -v xdg-open >/dev/null; then
    xdg-open "$FRONTEND_URL" >/dev/null 2>&1 &
  fi
fi

echo "Use ./stop.sh to shut everything down, ./status.sh to check health."
