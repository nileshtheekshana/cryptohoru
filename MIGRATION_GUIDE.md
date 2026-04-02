# 🔄 Migration Guide: Replace Existing Site with CryptoHoru

## Current Situation
- **Domain:** softsace.com (currently hosting a live website)
- **Goal:** Replace the existing site with CryptoHoru
- **Server:** Already has existing configuration

---

## ⚠️ IMPORTANT: Backup First!

Before proceeding, **backup your current website**:

```bash
# On your VPS
ssh root@softsace.com

# Create backup directory
mkdir -p /root/backups/$(date +%Y%m%d)

# Backup current website files
cp -r /var/www/* /root/backups/$(date +%Y%m%d)/

# Backup Nginx configurations
cp -r /etc/nginx/sites-available/* /root/backups/$(date +%Y%m%d)/
cp -r /etc/nginx/sites-enabled/* /root/backups/$(date +%Y%m%d)/

# List backups
ls -lh /root/backups/$(date +%Y%m%d)/
```

---

## 🎯 Migration Steps Overview

1. **Fix Node.js installation** (v20 required)
2. **Backup existing website**
3. **Remove old website files**
4. **Clean up old Nginx configuration**
5. **Deploy CryptoHoru**
6. **Configure Nginx for softsace.com**
7. **Test the new site**
8. **(Optional) Add SSL certificate**

---

## 📋 STEP 1: Fix Node.js Installation

### Option A: Use the automated script

```bash
# On your VPS
cd /root

# Upload the fix script (see VPS_FIX_README.md for upload methods)
# Then run:
chmod +x fix-vps-nodejs.sh
bash fix-vps-nodejs.sh
```

### Option B: Manual fix

```bash
# Remove Docker repositories
rm -f /etc/apt/sources.list.d/docker*.list
sed -i '/docker/d' /etc/apt/sources.list

# Remove old Node.js
apt remove -y nodejs npm libnode* node-*
apt autoremove -y
apt clean

# Update packages
apt update

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Verify
node --version  # v20.x.x
npm --version   # 10.x.x
pm2 --version
```

---

## 📋 STEP 2: Identify Current Setup

Find out what's currently running:

```bash
# Check what's in /var/www
ls -la /var/www/

# Check PM2 processes
pm2 list

# Check Nginx sites
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Check what's running on port 80
netstat -tulpn | grep :80

# Check what's running on port 3000
netstat -tulpn | grep :3000
```

**Note down:**
- Current website directory location
- Any PM2 processes running
- Nginx configuration file names

---

## 📋 STEP 3: Stop and Remove Old Website

### Stop old PM2 processes

```bash
# List all PM2 processes
pm2 list

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all

# Verify
pm2 list  # Should show "No processes"
```

### Remove old website files

```bash
# Check current content
ls -la /var/www/

# Remove old website (adjust path if needed)
# CAUTION: Make sure you backed up first!
rm -rf /var/www/html/*
# Or if your site is in a different folder:
# rm -rf /var/www/old-site-name
```

### Remove old Nginx configurations

```bash
# List current configs
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Remove old site configs
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/default

# Keep only the main nginx.conf
# Don't delete this: /etc/nginx/nginx.conf
```

---

## 📋 STEP 4: Deploy CryptoHoru

### Clone the repository

```bash
# Create fresh directory
mkdir -p /var/www
cd /var/www

# Clone CryptoHoru
git clone https://github.com/nileshtheekshana/cryptohoru.git

# Enter directory
cd cryptohoru
```

### Install dependencies

```bash
npm install
```

This will take 2-3 minutes.

---

## 📋 STEP 5: Configure Environment Variables

### Create .env.local file

```bash
cd /var/www/cryptohoru
nano .env.local
```

**Add this content:**

```bash
# MongoDB Atlas Connection String
# Get this from MongoDB Atlas (see HOSTING_GUIDE.md Step 1.5)
MONGODB_URI=mongodb+srv://cryptohoru_admin:YOUR_PASSWORD@cryptohoru-cluster.xxxxx.mongodb.net/cryptohoru?retryWrites=true&w=majority

# Generate on your LOCAL Kali machine with: openssl rand -base64 32
AUTH_SECRET=your-generated-secret-here

# Your domain (use softsace.com)
NEXTAUTH_URL=http://softsace.com

# Environment
NODE_ENV=production
PORT=3000
```

**To generate AUTH_SECRET:**
```bash
# On your LOCAL Kali machine (new terminal):
openssl rand -base64 32
# Copy and paste the result above
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## 📋 STEP 6: Build the Application

```bash
cd /var/www/cryptohoru
npm run build
```

This takes 2-3 minutes. Wait for it to complete.

---

## 📋 STEP 7: Start with PM2

```bash
# Start the application
pm2 start npm --name "cryptohoru" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# IMPORTANT: Copy and run the command it shows!

# Check status
pm2 status
pm2 logs cryptohoru --lines 20
```

**Test:** Open browser to `http://softsace.com:3000` - should see your site!

---

## 📋 STEP 8: Configure Nginx for softsace.com

### Create Nginx configuration

```bash
nano /etc/nginx/sites-available/cryptohoru
```

**Add this configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name softsace.com www.softsace.com;
    
    # Redirect www to non-www (optional but recommended)
    if ($host = www.softsace.com) {
        return 301 http://softsace.com$request_uri;
    }
    
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
    
    # Optional: Custom error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Enable the site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/cryptohoru /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# If test passes, restart Nginx
systemctl restart nginx

# Check Nginx status
systemctl status nginx
```

### Update environment variable

```bash
nano /var/www/cryptohoru/.env.local
```

**Change:**
```
NEXTAUTH_URL=http://softsace.com
```

**Make sure it's just:**
```
NEXTAUTH_URL=http://softsace.com
```
(No port number!)

**Save and restart PM2:**
```bash
pm2 restart cryptohoru
```

---

## 📋 STEP 9: Test the Website

### Open in browser:

1. **Main domain:** http://softsace.com
   - Should load the homepage

2. **Auth pages:**
   - http://softsace.com/auth/signin
   - http://softsace.com/auth/signup

3. **Public pages:**
   - http://softsace.com/airdrops
   - http://softsace.com/ama
   - http://softsace.com/giveaways

### Check logs:

```bash
# PM2 logs
pm2 logs cryptohoru

# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## 📋 STEP 10: Add SSL Certificate (HTTPS)

**IMPORTANT:** Your existing site likely has SSL. Let's renew/replace it for CryptoHoru.

### Check existing SSL certificates:

```bash
certbot certificates
```

### Option A: Use existing SSL (if valid for softsace.com)

```bash
# Just reconfigure nginx
certbot --nginx -d softsace.com -d www.softsace.com
```

### Option B: Get new SSL certificate

```bash
# Install Certbot (if not already installed)
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d softsace.com -d www.softsace.com

# Follow prompts:
# 1. Enter email: your-email@example.com
# 2. Agree to terms: Y
# 3. Share email?: N
# 4. Redirect HTTP to HTTPS?: 2 (Yes)
```

### Update environment for HTTPS:

```bash
nano /var/www/cryptohoru/.env.local
```

**Change:**
```
NEXTAUTH_URL=http://softsace.com
```

**To:**
```
NEXTAUTH_URL=https://softsace.com
```

**Save and restart:**
```bash
pm2 restart cryptohoru
systemctl restart nginx
```

### Test HTTPS:

Visit: **https://softsace.com** - Should work with padlock! 🔒

---

## 📋 STEP 11: Create Admin User

### Generate password hash:

```bash
# On your LOCAL Kali machine:
node -e "console.log(require('bcryptjs').hashSync('YourStrongAdminPassword123!', 12))"
```

Copy the hash (starts with `$2a$12$...`)

### Insert into MongoDB Atlas:

1. Go to: https://cloud.mongodb.com
2. Login to your account
3. Click **"Browse Collections"**
4. Database: `cryptohoru`
5. Collection: Click **"CREATE COLLECTION"** → Name: `users`
6. Click **"INSERT DOCUMENT"**
7. Switch to **"JSON"** view
8. Paste this:

```json
{
  "name": "Admin",
  "email": "admin@softsace.com",
  "password": "$2a$12$YOUR_HASHED_PASSWORD_HERE",
  "role": "admin",
  "completedTasks": [],
  "followedAirdrops": [],
  "createdAt": {"$date": "2025-10-13T00:00:00.000Z"},
  "updatedAt": {"$date": "2025-10-13T00:00:00.000Z"}
}
```

9. Click **"Insert"**

### Test admin login:

1. Go to: https://softsace.com/auth/signin
2. Email: `admin@softsace.com`
3. Password: `YourStrongAdminPassword123!`
4. Should see "Admin Panel" button in navbar
5. Click it to access: https://softsace.com/admin

---

## ✅ Final Verification Checklist

- [ ] **Node.js v20.x.x installed:** `node --version`
- [ ] **npm installed:** `npm --version`
- [ ] **PM2 running:** `pm2 status`
- [ ] **Nginx running:** `systemctl status nginx`
- [ ] **Site loads:** http://softsace.com or https://softsace.com
- [ ] **Homepage displays correctly**
- [ ] **Can signup:** /auth/signup
- [ ] **Can signin:** /auth/signin
- [ ] **Admin login works**
- [ ] **Admin panel accessible:** /admin
- [ ] **Can create airdrops**
- [ ] **All public pages work:** /airdrops, /ama, /giveaways, etc.

---

## 🔄 Daily Workflow (Making Changes)

### On Local Machine (Kali):

```bash
cd /home/nilesh/Desktop/cryptohoruweb

# Make changes to code
# Test locally: npm run dev

# Commit and push
git add .
git commit -m "Your update message"
git push origin main
```

### On VPS (softsace.com):

```bash
ssh root@softsace.com
cd /var/www/cryptohoru

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart cryptohoru

# Check logs
pm2 logs cryptohoru
```

### Quick Deploy Script:

Create a deploy script for easy updates:

```bash
# On VPS
nano /var/www/cryptohoru/deploy.sh
```

**Add:**
```bash
#!/bin/bash
echo "🚀 Deploying CryptoHoru..."
cd /var/www/cryptohoru
git pull origin main
npm install
npm run build
pm2 restart cryptohoru
echo "✅ Deployment complete!"
pm2 logs cryptohoru --lines 10
```

**Make executable:**
```bash
chmod +x /var/www/cryptohoru/deploy.sh
```

**Deploy with one command:**
```bash
/var/www/cryptohoru/deploy.sh
```

---

## 🆘 Troubleshooting

### Site shows old content:

```bash
# Hard refresh browser (Ctrl+F5)
# Or clear browser cache

# On VPS, check if correct files:
ls -la /var/www/cryptohoru/

# Restart services:
pm2 restart cryptohoru
systemctl restart nginx
```

### 502 Bad Gateway error:

```bash
# Check if app is running:
pm2 status

# Check logs:
pm2 logs cryptohoru

# Restart app:
pm2 restart cryptohoru

# If app crashed, check what's wrong in logs
```

### SSL certificate issues:

```bash
# Check certificate status:
certbot certificates

# Renew certificates:
certbot renew

# Restart nginx:
systemctl restart nginx
```

### MongoDB connection issues:

```bash
# Check .env.local:
cat /var/www/cryptohoru/.env.local

# Verify connection string is correct
# Check MongoDB Atlas network access (0.0.0.0/0)
```

### Port 3000 already in use:

```bash
# Find what's using it:
lsof -i :3000

# Kill the process:
kill -9 PID

# Restart PM2:
pm2 restart cryptohoru
```

---

## 🎉 Success!

Your **softsace.com** domain now hosts **CryptoHoru**! 

The old website has been replaced, and your new airdrop platform is live!

**Next steps:**
1. ✅ Test all features thoroughly
2. ✅ Create some test airdrops
3. ✅ Test user signup and dashboard
4. ✅ Start adding real content
5. ✅ Share with users!

---

## 💾 Backup Strategy

### Regular backups (recommended weekly):

```bash
# On VPS, create backup script:
nano /root/backup.sh
```

**Add:**
```bash
#!/bin/bash
BACKUP_DIR="/root/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup website files
cp -r /var/www/cryptohoru $BACKUP_DIR/

# Backup Nginx configs
cp -r /etc/nginx/sites-available $BACKUP_DIR/
cp -r /etc/nginx/sites-enabled $BACKUP_DIR/

# Backup .env.local
cp /var/www/cryptohoru/.env.local $BACKUP_DIR/

echo "✅ Backup created at: $BACKUP_DIR"
ls -lh $BACKUP_DIR
```

**Make executable and run:**
```bash
chmod +x /root/backup.sh
/root/backup.sh
```

---

**Need help? Let me know!** 🚀
