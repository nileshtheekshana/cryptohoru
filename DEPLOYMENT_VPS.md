# 🚀 VPS Deployment Guide - Git Workflow

This guide shows you how to deploy your CryptoHoru app on a VPS with easy updates via Git.

## 📋 Overview

**Workflow:**
1. Develop locally on your machine
2. Push changes to Git (GitHub/GitLab/Bitbucket)
3. Pull changes on VPS
4. Restart the app automatically
5. Nginx serves the app to the world

**Tools Used:**
- **Git** - Version control and deployment
- **PM2** - Process manager (keeps app running)
- **Nginx** - Reverse proxy (handles domain and SSL)
- **Node.js** - Runtime environment

---

## 🛠️ Part 1: Initial VPS Setup

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
# Or if you have a user:
ssh username@your-vps-ip
```

### 2. Update System

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl build-essential
```

### 3. Install Node.js 20.x

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 5. Install Nginx (Web Server)

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## 📦 Part 2: Setup Git Repository

### Option A: Using GitHub (Recommended)

**On Your Local Machine:**

```bash
# Navigate to your project
cd /home/nilesh/Desktop/cryptohoruweb

# Initialize git (if not already done)
git init

# Create .gitignore (already exists, but verify it includes:)
# node_modules/
# .next/
# .env.local
# .turbo/

# Add all files
git add .

# Commit
git commit -m "Initial commit - CryptoHoru Platform"

# Create repository on GitHub, then:
git remote add origin https://github.com/your-username/cryptohoru.git
git branch -M main
git push -u origin main
```

**On Your VPS:**

```bash
# Create app directory
mkdir -p /var/www/cryptohoru
cd /var/www/cryptohoru

# Clone your repository
git clone https://github.com/your-username/cryptohoru.git .

# Or use SSH (recommended for easier updates):
git clone git@github.com:your-username/cryptohoru.git .
```

### Option B: Using GitLab or Bitbucket

Same process, just replace the Git URL with your GitLab/Bitbucket repository URL.

---

## ⚙️ Part 3: Configure Environment on VPS

### 1. Create Production Environment File

```bash
cd /var/www/cryptohoru

# Create .env.local (or .env.production)
nano .env.local
```

**Add your production values:**

```bash
# MongoDB Atlas Connection (same as local or separate production DB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cryptohoru

# Generate a NEW secret for production (different from local!)
AUTH_SECRET=your-production-secret-here

# Your production domain
NEXTAUTH_URL=https://yourdomain.com

# Optional: Node environment
NODE_ENV=production
```

**Generate production secret:**
```bash
openssl rand -base64 32
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
npm run build
```

This creates the optimized production build in `.next/` folder.

---

## 🔄 Part 4: Setup PM2 (Process Manager)

### 1. Create PM2 Ecosystem File

```bash
nano ecosystem.config.js
```

**Add this configuration:**

```javascript
module.exports = {
  apps: [{
    name: 'cryptohoru',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/cryptohoru',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 2. Start the App with PM2

```bash
# Start the app
pm2 start ecosystem.config.js

# Save PM2 configuration (survives server reboot)
pm2 save

# Enable PM2 to start on system boot
pm2 startup
# Follow the command it gives you (copy-paste and run it)
```

### 3. Useful PM2 Commands

```bash
# View running apps
pm2 list

# View logs
pm2 logs cryptohoru

# Restart app
pm2 restart cryptohoru

# Stop app
pm2 stop cryptohoru

# Delete app from PM2
pm2 delete cryptohoru

# Monitor resource usage
pm2 monit
```

---

## 🌐 Part 5: Configure Nginx (Reverse Proxy)

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/cryptohoru
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/cryptohoru /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 3. Configure DNS

In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

- Add an **A Record**: `@` → `your-vps-ip`
- Add an **A Record**: `www` → `your-vps-ip`

Wait 5-15 minutes for DNS propagation.

---

## 🔒 Part 6: Setup SSL Certificate (HTTPS)

### Install Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

Your site is now accessible at `https://yourdomain.com` 🎉

---

## 🔄 Part 7: Deploy Updates (Regular Workflow)

### On Your Local Machine (Development)

```bash
# Make changes to your code
# Test locally with: npm run dev

# Commit changes
git add .
git commit -m "Add new feature X"

# Push to GitHub/GitLab
git push origin main
```

### On Your VPS (Production)

**Manual Update (Simple):**

```bash
cd /var/www/cryptohoru

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild the app
npm run build

# Restart with PM2
pm2 restart cryptohoru

# View logs to confirm
pm2 logs cryptohoru
```

### Automated Update Script (Advanced)

Create a deployment script:

```bash
nano /var/www/cryptohoru/deploy.sh
```

**Add this script:**

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

cd /var/www/cryptohoru

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart cryptohoru

echo "✅ Deployment complete!"
echo "📊 Application status:"
pm2 status cryptohoru
```

**Make it executable:**

```bash
chmod +x /var/www/cryptohoru/deploy.sh
```

**Run deployment with one command:**

```bash
/var/www/cryptohoru/deploy.sh
```

---

## 🎯 Part 8: Quick Command Reference

### Daily Workflow

**Local Development:**
```bash
# 1. Make changes
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Update feature"
git push origin main
```

**VPS Deployment:**
```bash
# SSH into VPS
ssh username@your-vps-ip

# Run deployment script
cd /var/www/cryptohoru && ./deploy.sh

# Or manually:
git pull && npm install && npm run build && pm2 restart cryptohoru
```

### Monitoring Commands

```bash
# View app logs
pm2 logs cryptohoru

# Monitor resources
pm2 monit

# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check app status
pm2 status
```

---

## 🔧 Troubleshooting

### App Won't Start

```bash
# Check PM2 logs
pm2 logs cryptohoru --lines 100

# Common issues:
# - Missing .env.local file
# - Wrong MongoDB connection string
# - Port 3000 already in use
# - Node version mismatch
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Restart app
pm2 restart cryptohoru

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Can't Pull from Git

```bash
# If you have local changes conflicting:
git stash  # Save local changes
git pull   # Pull updates
git stash pop  # Reapply local changes (if needed)

# Or reset to remote:
git fetch origin
git reset --hard origin/main
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📊 Alternative Deployment Options

### Option 1: GitHub Actions (CI/CD)

Automate deployment on every push:

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/cryptohoru
            git pull origin main
            npm install
            npm run build
            pm2 restart cryptohoru
```

### Option 2: Docker (Containerization)

More complex but better isolation:

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Vercel/Netlify (Serverless)

Easiest but less control:
- Just push to GitHub
- Connect repository to Vercel
- Auto-deploy on every push

---

## 🎉 Summary

**Your Production Stack:**
- **VPS** - Your server
- **Git** - Version control and deployment
- **Node.js** - JavaScript runtime
- **PM2** - Keeps app running 24/7
- **Nginx** - Web server and reverse proxy
- **Let's Encrypt** - Free SSL certificates

**Update Workflow:**
1. Code locally → Test → Commit → Push to Git
2. SSH to VPS → Pull → Build → Restart
3. Done! ✅

**Estimated Setup Time:** 30-60 minutes first time, 30 seconds for updates

---

## 📚 Additional Resources

- PM2 Docs: https://pm2.keymetrics.io/
- Nginx Docs: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- Next.js Deployment: https://nextjs.org/docs/deployment

**Need help?** Check the logs first:
- `pm2 logs cryptohoru`
- `sudo tail -f /var/log/nginx/error.log`

Good luck with your deployment! 🚀
