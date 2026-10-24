#!/usr/bin/env bash
# NEXUS Spectacle — stop backend + frontend dev servers started by start.sh.
set -uo pipefail

FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORTS=(${BACKEND_PORT:-5000} 5001 5002 5003)

kill_by_pattern() {
  local pattern="$1"
  local pids
  pids=$(pgrep -f "$pattern" || true)
  if [[ -z "$pids" ]]; then
    echo "  (none found: $pattern)"
    return 0
  fi
  echo "  stopping: $pattern (pid(s): $(echo "$pids" | tr '\n' ' '))"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null || true
  sleep 1
  pids=$(pgrep -f "$pattern" || true)
  if [[ -n "$pids" ]]; then
    echo "  force-killing: $(echo "$pids" | tr '\n' ' ')"
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
}

echo "==> Stopping NEXUS Spectacle..."

# Kill by unmistakable command-line patterns (scoped to this project where possible).
kill_by_pattern "nexus-spectacle-updates/server/index\.js"
kill_by_pattern "nexus-spectacle-updates/server/node_modules"
kill_by_pattern "vite.*--port $FRONTEND_PORT"
kill_by_pattern "npm run dev -- --host.*--port $FRONTEND_PORT"

# Free any leftover listeners on our ports (only processes owned by this user).
for port in "${BACKEND_PORTS[@]}" "$FRONTEND_PORT"; do
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" >/dev/null 2>&1 || true
  fi
done

echo "==> Done. Verify with ./status.sh"
