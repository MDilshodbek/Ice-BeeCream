# ===========================
# PRODUCTION DEPLOY
# ===========================

Write-Host "Resetting repository..."
git reset --hard

Write-Host "Switching to master branch..."
git checkout master
git pull origin master

Write-Host "Installing dependencies..."
npm install

Write-Host "Building production..."
npm run build

Write-Host "Starting production with PM2..."
pm2 start process.config.js --env production


# ===========================
# DEVELOPMENT DEPLOY
# ===========================

# Write-Host "Resetting repository..."
# git reset --hard

# Write-Host "Switching to develop branch..."
# git checkout develop
# git pull origin develop

# Write-Host "Installing dependencies..."
# npm install

# Write-Host "Starting development server..."
# pm2 start "npm run start:dev" --name ICEBEECREAM
