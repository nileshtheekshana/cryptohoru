#!/bin/bash

# Cryptohoru VPS Deployment Script
# This script pulls latest changes, builds, and restarts the application

echo "🚀 Starting deployment to cryptohoru.com..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Navigate to project directory
cd /var/www/cryptohoru || { echo "❌ Error: Project directory not found!"; exit 1; }

echo "📂 Current directory: $(pwd)"
echo ""

# Pull latest changes from GitHub
echo "⬇️  Pulling latest changes from GitHub..."
git pull origin main || { echo "❌ Error: Git pull failed!"; exit 1; }
echo "✅ Git pull completed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install || { echo "❌ Error: npm install failed!"; exit 1; }
echo "✅ Dependencies installed"
echo ""

# Build the Next.js application
echo "🏗️  Building Next.js application..."
npm run build || { echo "❌ Error: Build failed!"; exit 1; }
echo "✅ Build completed"
echo ""

# Restart PM2
echo "🔄 Restarting PM2 process..."
pm2 restart cryptohoru || { echo "❌ Error: PM2 restart failed!"; exit 1; }
echo "✅ PM2 restarted"
echo ""

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save
echo ""

# Show PM2 status
echo "📊 Current PM2 Status:"
pm2 status
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment completed successfully!"
echo "🌐 Your site is live at: https://cryptohoru.com"
echo ""
echo "📝 To view logs, run: pm2 logs cryptohoru"
echo "📊 To view status, run: pm2 status"
