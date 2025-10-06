#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PID=""

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

PORT="${PORT:-3000}"
API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3000/api}"
FRONTEND_PORT="${FRONTEND_PORT:-3100}"

function log() {
  printf '\n\033[1m➡ %s\033[0m\n' "$1"
}

function wait_for_url() {
  local url="$1"
  local retries=${2:-30}
  local delay=${3:-2}
  local attempt=1
  until curl -sf "$url" >/dev/null 2>&1; do
    if (( attempt > retries )); then
      echo "Timed out waiting for $url"
      return 1
    fi
    sleep "$delay"
    ((attempt++))
  done
}

wait_for_postgres() {
  local retries=${1:-30}
  local delay=${2:-2}
  local attempt=1
  while ! docker compose exec postgres pg_isready -U ncsadmin -d ncsdb >/dev/null 2>&1; do
    if (( attempt > retries )); then
      echo "Postgres healthcheck failed after $retries attempts"
      return 1
    fi
    sleep "$delay"
    ((attempt++))
  done
}

ensure_port_free() {
  local port="$1"
  local label="${2:-service}"

  if ! command -v lsof >/dev/null 2>&1; then
    echo "lsof is required to manage $label port $port"
    exit 1
  fi

  local pids
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [[ -z "$pids" ]]; then
    return
  fi

  log "Freeing $label port $port (pids: $pids)"
  while read -r pid; do
    [[ -n "$pid" ]] || continue
    kill "$pid" 2>/dev/null || true
  done <<< "$pids"

  sleep 1

  local remaining
  remaining=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [[ -z "$remaining" ]]; then
    return
  fi

  echo "Processes still holding $label port $port; forcing termination ($remaining)"
  while read -r pid; do
    [[ -n "$pid" ]] || continue
    kill -9 "$pid" 2>/dev/null || true
  done <<< "$remaining"

  sleep 1

  remaining=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [[ -n "$remaining" ]]; then
    echo "Failed to free $label port $port (pids: $remaining)"
    exit 1
  fi
}

log "Starting infrastructure (Postgres & Redis)"
docker compose up -d postgres redis
log "Waiting for Postgres to accept connections"
wait_for_postgres || exit 1

log "Installing backend dependencies"
(cd "$BACKEND_DIR" && npm install)

log "Running Prisma migrations"
(cd "$BACKEND_DIR" && npm run db:migrate)

log "Seeding database"
(cd "$BACKEND_DIR" && npm run db:seed)

ensure_port_free "$PORT" "backend"
log "Launching backend on port $PORT"
(cd "$BACKEND_DIR" && PORT="$PORT" npm run start:dev) &
BACKEND_PID=$!

get_backend_group() {
  if [[ -z "$BACKEND_PID" ]]; then
    return
  fi
  ps -o pgid= "$BACKEND_PID" 2>/dev/null | tr -d '[:space:]'
}

cleanup() {
  local backend_group
  backend_group=$(get_backend_group)
  if [[ -n "$BACKEND_PID" ]] && ps -p "$BACKEND_PID" >/dev/null 2>&1; then
    echo "\nShutting down backend dev server..."
    if [[ -n "$backend_group" ]]; then
      kill -TERM -"$backend_group" 2>/dev/null || true
    else
      kill "$BACKEND_PID" 2>/dev/null || true
    fi
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ "${KEEP_SERVICES:-}" != "true" ]]; then
    echo "Stopping docker compose services (postgres, redis)..."
    docker compose stop postgres redis >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

log "Waiting for backend health endpoint"
wait_for_url "http://localhost:${PORT}/api/health"

log "Installing frontend dependencies"
(cd "$FRONTEND_DIR" && npm install)

ensure_port_free "$FRONTEND_PORT" "frontend"
log "Launching frontend with API base $API_URL (port $FRONTEND_PORT)"
(cd "$FRONTEND_DIR" && NEXT_PUBLIC_API_URL="$API_URL" npm run dev -- --port "$FRONTEND_PORT")
