#!/usr/bin/env bash
set -euo pipefail

# --- CONFIG (change if needed) ---
PM2_APP_NAME="IceAdmin"
ECOSYSTEM_FILE="process.linux.config.js"
# ---------------------------------

echo "==> Moving to backend folder (script folder)"
cd "$(dirname "$0")"

echo "==> Resetting repository to clean state"
git reset --hard

echo "==> Checking out master branch"
git checkout master

echo "==> Pulling latest production code"
git pull origin master

echo "==> Installing dependencies (npm ci if lockfile exists, otherwise npm install)"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "==> Building backend"
npm run build

echo "==> Starting PM2 app using ecosystem file"
pm2 start "$ECOSYSTEM_FILE"
pm2 save

echo "==> Done"
pm2 status
