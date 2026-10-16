#!/bin/bash
# Smoke test runner: builds the app, resets a throwaway test database
# (hsms_test), boots the real server against it with SEED_ON_BOOT=true
# (seeds roles/lookups/test users/sample project+plots), then runs the
# smoke test suite against that running server through real HTTP calls.
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export MONGO_URI="mongodb://127.0.0.1:27017/hsms_test?replicaSet=rs0"
export PORT=5002
export SEED_ON_BOOT=true
export LITE_MODE=1
export ENABLE_OVERDUE_CRON=false
# development (not test/production) so the error handler includes the real
# error message in responses - needed to assert on specific rejection
# reasons (e.g. "does not reconcile", "already allocated") instead of just
# the generic "Internal server error" that's shown in test/production.
export NODE_ENV=development

export SMOKE_API_URL="http://localhost:${PORT}/api"

LOG_FILE="/tmp/hsms-smoke-server.log"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "Stopping test server (pid $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
  fi
}
trap cleanup EXIT

echo "=== 1/5: Building backend ==="
pnpm build || exit 1

echo "=== 2/6: Dropping throwaway test database (hsms_test) ==="
npx ts-node scripts/drop-test-db.ts || exit 1

echo "=== 3/6: Building indexes on hsms_test (autoIndex is off under LITE_MODE) ==="
MONGO_URI="$MONGO_URI" npx ts-node src/database/sync-indexes.ts --apply || exit 1

echo "=== 4/6: Starting server on port $PORT against hsms_test (SEED_ON_BOOT=true) ==="
node dist/server.js > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

echo "Waiting for server health..."
READY=0
for i in $(seq 1 60); do
  if curl -s "http://localhost:${PORT}/health" >/dev/null 2>&1; then
    READY=1
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "Server process died during startup. Log tail:"
    tail -n 60 "$LOG_FILE"
    exit 1
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "Server did not become healthy in time. Log tail:"
  tail -n 60 "$LOG_FILE"
  exit 1
fi

echo "Server healthy. Waiting a moment for SEED_ON_BOOT to finish..."
sleep 3

echo "=== 5/6: Running smoke test suite ==="
npx jest --config jest.smoke.config.js --runInBand "$@"
JEST_EXIT=$?

echo "=== 6/6: Done (exit code $JEST_EXIT) ==="
if [ "$JEST_EXIT" -ne 0 ]; then
  echo "--- Server log tail (for debugging failures) ---"
  tail -n 80 "$LOG_FILE"
fi

exit $JEST_EXIT
