#!/bin/bash

# CryptoHoru Deployment Script
# This script pulls latest code and deploys to production

# GitHub credentials for private repo
GIT_USERNAME="buweshrajitha"
GIT_PASSWORD="YOUR_GITHUB_TOKEN_HERE"  # Replace with your GitHub Personal Access Token

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting CryptoHoru deployment...${NC}"
echo ""

# Navigate to project directory
echo -e "${YELLOW}📂 Navigating to project directory...${NC}"
cd /var/www/cryptohoru

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to navigate to /var/www/cryptohoru${NC}"
    exit 1
fi

# Configure git credentials for this session
echo -e "${YELLOW}🔐 Configuring git credentials...${NC}"
git config credential.helper store

# Pull latest changes from GitHub
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
echo ""

# Use credentials in the git pull command
git pull https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/nileshtheekshana/cryptohoru.git main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed! Please check your credentials or network connection.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Successfully pulled latest changes${NC}"
echo ""

# Install/Update dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Build application
echo -e "${YELLOW}🏗️  Building application (this may take a minute)...${NC}"
NODE_OPTIONS="--max_old_space_size=1024" npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Check the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"
echo ""

# Restart application with PM2
echo -e "${YELLOW}🔄 Restarting application...${NC}"
pm2 restart cryptohoru

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to restart application${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${GREEN}📊 Application status:${NC}"
pm2 status cryptohoru
echo ""
echo -e "${GREEN}📝 Recent logs (last 15 lines):${NC}"
pm2 logs cryptohoru --lines 15 --nostream
echo ""
echo -e "${GREEN}🎉 CryptoHoru is now live with the latest changes!${NC}"
