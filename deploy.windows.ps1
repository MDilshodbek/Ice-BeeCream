$ErrorActionPreference = "Stop"

$PM2_APP_NAME    = "IceAdmin"
$ECOSYSTEM_FILE  = "process.windows.config.js"
$GIT_BRANCH      = "master"

Write-Host "==> Move to project directory (folder of this script)"
Set-Location -Path $PSScriptRoot

# Write-Host "==> Resetting local repository to clean state"
# git reset --hard

# Write-Host "==> Checking out deployment branch: $GIT_BRANCH"
# git checkout $GIT_BRANCH

# Write-Host "==> Pulling latest code from origin/$GIT_BRANCH"
# git pull origin $GIT_BRANCH

Write-Host "==> Installing dependencies"
if (Test-Path "package-lock.json") {
  Write-Host "    package-lock.json found -> npm ci"
  npm ci
} else {
  Write-Host "    package-lock.json NOT found -> npm install"
  npm install
}

Write-Host "==> Building backend"
npm run build

pm2 start $ECOSYSTEM_FILE

Write-Host "==> Saving PM2 process list"
pm2 save

Write-Host "==> Done. Current PM2 status:"
pm2 status
