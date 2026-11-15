#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$(cd "${ROOT_DIR}/../Ana-Quran-Academy-Backend" && pwd)"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_PORT="${BACKEND_PORT:-5001}"

cleanup_port() {
  local port="$1"
  for pid in $(lsof -ti tcp:"$port" 2>/dev/null || true); do
    kill -9 "$pid" 2>/dev/null || true
  done
}

cleanup_port "$FRONTEND_PORT"
cleanup_port "$BACKEND_PORT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not on PATH. Install Docker Desktop and retry."
  exit 1
fi

# Docker Desktop can leave a stale or wrong context selected in a shell; force the
# active context to the desktop engine before checking the daemon.
unset DOCKER_HOST DOCKER_CONTEXT 2>/dev/null || true
if ! docker context use desktop-linux >/dev/null 2>&1; then
  echo "Docker Desktop context is unavailable. Open Docker Desktop and start the engine, then retry."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Start Docker Desktop (or the Docker service) and then run:"
  echo "  cd /Users/khaled/Academy/Ana-Quran-Academy-Backend && docker compose up -d postgres"
  exit 1
fi

if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok is not installed or not on PATH. Install ngrok and run: ngrok auth login"
  exit 1
fi

echo "Starting local Postgres for the API..."
(cd "$BACKEND_DIR" && docker compose up -d postgres) || {
  echo "Postgres could not be started from docker compose."
  echo "Check docker compose in /Users/khaled/Academy/Ana-Quran-Academy-Backend and retry."
  exit 1
}

# Ensure only one ngrok tunnel remains for the frontend port.
if pgrep -f "ngrok http ${FRONTEND_PORT}" >/dev/null 2>&1; then
  pkill -f "ngrok http ${FRONTEND_PORT}" || true
fi

ngrok http "$FRONTEND_PORT" --log=stdout > /tmp/academy-ngrok.log 2>&1 &
NGROK_PID=$!
trap 'kill $NGROK_PID 2>/dev/null || true; kill $(jobs -p) 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  if curl -fsS http://localhost:4040/api/tunnels >/tmp/academy-ngrok-tunnels.json 2>/dev/null; then
    break
  fi
  sleep 1
done

TUNNEL_URL="$(python3 - <<'PY'
import json
import sys
import urllib.request

try:
    with urllib.request.urlopen('http://localhost:4040/api/tunnels', timeout=5) as response:
        data = json.load(response)
except Exception:
    raise SystemExit(1)

for tunnel in data.get('tunnels', []):
    public_url = tunnel.get('public_url')
    if tunnel.get('proto') == 'https' and public_url:
        print(public_url)
        raise SystemExit(0)
    if public_url:
        print(public_url)
        raise SystemExit(0)

raise SystemExit(1)
PY
)" || {
  echo "Unable to detect an ngrok tunnel for port ${FRONTEND_PORT}."
  echo "Check that ngrok is installed and running: ngrok http ${FRONTEND_PORT}"
  exit 1
}

export NEXT_PUBLIC_SITE_URL="$TUNNEL_URL"
export NEXT_PUBLIC_BACKEND_URL=""
export API_ORIGIN="http://localhost:${BACKEND_PORT}"
export AllowedOrigins="http://localhost:${FRONTEND_PORT},${TUNNEL_URL}"

cd "$BACKEND_DIR"
ASPNETCORE_ENVIRONMENT=Development AllowedOrigins="$AllowedOrigins" dotnet run --project src/Academy.Api/Academy.Api.csproj --urls "http://localhost:${BACKEND_PORT}" &
BACKEND_PID=$!

trap 'kill $NGROK_PID 2>/dev/null || true; kill $BACKEND_PID 2>/dev/null || true; kill $(jobs -p) 2>/dev/null || true' EXIT

echo ""
echo "Local frontend: http://localhost:${FRONTEND_PORT}"
echo "Local backend:  http://localhost:${BACKEND_PORT}"
echo "Tunnel URL:     ${TUNNEL_URL}"
echo "Allowed origins: ${AllowedOrigins}"
echo ""

echo "Press Ctrl+C to stop the local frontend + tunnel + backend."

echo "Browser test URL: ${TUNNEL_URL}/login"

echo "Login API URL:     ${TUNNEL_URL}/api/auth/login"

echo ""

cd "$ROOT_DIR"
NEXT_PUBLIC_SITE_URL="$TUNNEL_URL" NEXT_PUBLIC_BACKEND_URL="" API_ORIGIN="http://localhost:${BACKEND_PORT}" npm run dev -- --hostname 0.0.0.0 --port "$FRONTEND_PORT"
