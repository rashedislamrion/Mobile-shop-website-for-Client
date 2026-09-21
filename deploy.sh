#!/usr/bin/env bash
# ==============================================================================
# MobileHubBD Production Deployment Script
# Targets: /var/www/mobilehubbd
# ==============================================================================

set -e # Exit immediately if any command fails

PROJECT_ROOT="/var/www/mobilehubbd"

echo "=========================================="
echo "🚀 Starting MobileHubBD Deployment"
echo "=========================================="

# 1. Navigate to project root & pull latest changes
cd "$PROJECT_ROOT"
echo "📥 Pulling latest code from origin/main..."
git pull origin main

# 2. Build and restart Backend (NestJS + Prisma)
echo ""
echo "⚙️ [1/2] Updating Backend API..."
cd "$PROJECT_ROOT/api"
npm install --omit=dev=false
npx prisma generate
npx prisma db push
npm run build

echo "🔄 Restarting Backend PM2 process (mobilehubbd-api)..."
pm2 restart mobilehubbd-api --update-env || pm2 start dist/main.js --name mobilehubbd-api

# 3. Build and restart Frontend (Next.js)
echo ""
echo "🌐 [2/2] Updating Frontend Web..."
cd "$PROJECT_ROOT"
npm install --omit=dev=false
npm run build

echo "🔄 Restarting Frontend PM2 process (mobilehubbd-web)..."
pm2 restart mobilehubbd-web --update-env || pm2 start npm --name mobilehubbd-web -- start

# 4. Save PM2 list
echo ""
echo "💾 Saving PM2 process state..."
pm2 save

echo ""
echo "=========================================="
echo "✅ Deployment finished successfully!"
echo "=========================================="
