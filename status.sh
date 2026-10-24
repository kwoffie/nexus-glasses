#!/usr/bin/env bash
# NEXUS Spectacle — health/status check for backend + frontend.
set -uo pipefail

FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORTS=(${BACKEND_PORT:-5000} 5001 5002 5003)

ok=0; fail=0
check() {
  local label="$1" url="$2"
  if curl -sf -m 3 "$url" >/dev/null 2>&1; then
    echo "  [UP]   $label -> $url"
    ok=$((ok+1))
  else
    echo "  [DOWN] $label -> $url"
    fail=$((fail+1))
  fi
}

echo "==> NEXUS Spectacle status"
echo "-- backend candidates --"
for port in "${BACKEND_PORTS[@]}"; do
  check "backend :$port" "http://127.0.0.1:$port/api/health"
done
echo "-- frontend --"
check "frontend :$FRONTEND_PORT" "http://127.0.0.1:$FRONTEND_PORT/"

echo ""
echo "-- processes --"
pgrep -af "nexus-spectacle-updates/server|vite.*--port $FRONTEND_PORT" || echo "  (no launcher processes found)"

echo ""
echo "Result: $ok up, $fail down."
[ "$fail" -eq 0 ] || exit 1
