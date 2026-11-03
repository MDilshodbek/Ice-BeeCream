#!/usr/bin/env bash
# Deploys one backend release on the server.
# Run by the self-hosted runner as user "deploy".
# Usage: deploy.sh /path/to/backend.tar.gz
set -euo pipefail

ARCHIVE="$1"
APP_DIR=/home/deploy/ice/backend
APP_NAME=ice-backend
PORT=4004
KEEP=3 # releases kept on disk for rollback

SHA="${GITHUB_SHA:-manual}"
RELEASE="$(date -u +%Y%m%d-%H%M%S)-${SHA:0:7}"
RELEASE_DIR="$APP_DIR/releases/$RELEASE"

export PM2_HOME=/home/deploy/.pm2
# Stop the runner from killing PM2 when the job ends.
export RUNNER_TRACKING_ID=""

switch_current() {
  ln -sfn "$1" "$APP_DIR/current.tmp"
  mv -Tf "$APP_DIR/current.tmp" "$APP_DIR/current"
}

is_up() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://127.0.0.1:$PORT/adminRouter" || true)"
  [ "$code" != "000" ]
}

echo "==> Unpacking release $RELEASE"
mkdir -p "$RELEASE_DIR"
tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"

echo "==> Linking .env.production and uploads from shared/"
ln -sfn "$APP_DIR/shared/.env.production" "$RELEASE_DIR/.env.production"
ln -sfn "$APP_DIR/shared/uploads" "$RELEASE_DIR/uploads"

PREVIOUS="$(readlink -f "$APP_DIR/current" 2>/dev/null || true)"

echo "==> Switching current -> $RELEASE"
switch_current "$RELEASE_DIR"

echo "==> Starting / reloading PM2 app $APP_NAME"
pm2 startOrReload "$APP_DIR/current/ecosystem.config.js" --update-env

echo "==> Waiting for the backend on 127.0.0.1:$PORT"
for i in $(seq 1 30); do
  if is_up; then
    echo "    up after ~$((i * 2))s"
    pm2 save
    echo "==> Removing old releases (keeping $KEEP)"
    ls -1dt "$APP_DIR"/releases/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf
    pm2 ls
    echo "==> Deployed $RELEASE"
    exit 0
  fi
  sleep 2
done

echo "!! Backend did not answer within 60s. Last logs:"
pm2 logs "$APP_NAME" --lines 40 --nostream || true

if [ -n "$PREVIOUS" ] && [ -d "$PREVIOUS" ] && [ "$PREVIOUS" != "$RELEASE_DIR" ]; then
  echo "==> Rolling back to $(basename "$PREVIOUS")"
  switch_current "$PREVIOUS"
  pm2 startOrReload "$APP_DIR/current/ecosystem.config.js" --update-env
fi
exit 1
