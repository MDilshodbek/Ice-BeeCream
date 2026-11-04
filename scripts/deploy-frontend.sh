#!/usr/bin/env bash
# Installs one frontend build (a GitHub Release of MDilshodbek/ice-react)
# into /home/deploy/ice/frontend. Run by the self-hosted runner as "deploy".
# Usage: deploy-frontend.sh build-12-abc1234
set -euo pipefail

TAG="${1:-}"
REPO=MDilshodbek/ice-react
APP_DIR=/home/deploy/ice/frontend
KEEP=3 # releases kept on disk for rollback

if [[ ! "$TAG" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "!! Invalid or missing tag: '$TAG'"
  exit 1
fi

URL="https://github.com/$REPO/releases/download/$TAG/frontend.tar.gz"
RELEASE_DIR="$APP_DIR/releases/$(date -u +%Y%m%d-%H%M%S)-$TAG"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> Downloading $URL"
curl -fsSL --retry 3 -o "$TMP/frontend.tar.gz" "$URL"

echo "==> Unpacking into $RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
tar -xzf "$TMP/frontend.tar.gz" -C "$RELEASE_DIR"
if [ ! -f "$RELEASE_DIR/index.html" ]; then
  echo "!! index.html missing, not switching"
  rm -rf "$RELEASE_DIR"
  exit 1
fi

echo "==> Making files readable by Nginx"
find "$RELEASE_DIR" -type d -exec chmod 755 {} +
find "$RELEASE_DIR" -type f -exec chmod 644 {} +

echo "==> Switching current -> $(basename "$RELEASE_DIR")"
ln -sfn "$RELEASE_DIR" "$APP_DIR/current.tmp"
mv -Tf "$APP_DIR/current.tmp" "$APP_DIR/current"

echo "==> Removing old releases (keeping $KEEP)"
ls -1d "$APP_DIR"/releases/*/ | sort -r | tail -n +$((KEEP + 1)) | xargs -r rm -rf

ls -1 "$APP_DIR/releases"
echo "==> Deployed frontend $TAG"
