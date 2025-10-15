# 🚀 Migration Script - Quick Start Guide

## Overview

The `migrate-to-cryptohoru.sh` script will **completely replace** your existing website on `softsace.com` with CryptoHoru.

## What It Does

✅ Backs up your existing website  
✅ Fixes Node.js installation (installs v20 with npm)  
✅ Stops and removes old website  
✅ Clones CryptoHoru from GitHub  
✅ Installs dependencies and builds the app  
✅ Configures Nginx for softsace.com  
✅ Sets up firewall (UFW)  
✅ Optionally installs SSL certificate  

---

## Prerequisites

Before running the script, prepare these:

### 1. MongoDB Atlas Connection String

Get this from MongoDB Atlas:
- Go to: https://cloud.mongodb.com
- Click "Connect" → "Connect your application"
- Copy the connection string

**Example:**
```
mongodb+srv://cryptohoru_admin:YourPassword@cluster.xxxxx.mongodb.net/cryptohoru?retryWrites=true&w=majority
```

### 2. AUTH_SECRET

Generate on your **LOCAL Kali machine**:

```bash
openssl rand -base64 32
```

**Example output:**
```
xK8p9mN2vL4qR7sT1wY3zB6cD5eF8gH0jI2kL4mN6oP8q
```

---

## Upload Script to VPS

### Option 1: SCP (Recommended)

On your **LOCAL Kali machine**:

```bash
cd /home/nilesh/Desktop/cryptohoruweb
scp migrate-to-cryptohoru.sh root@softsace.com:/root/
```

### Option 2: Copy-Paste

1. On VPS:
   ```bash
   nano /root/migrate-to-cryptohoru.sh
   ```

2. Copy the entire content of `migrate-to-cryptohoru.sh`
3. Paste into nano
4. Save: `Ctrl+X`, `Y`, `Enter`

### Option 3: Download from GitHub (after pushing)

```bash
# On VPS
cd /root
wget https://raw.githubusercontent.com/nileshtheekshana/cryptohoru/main/migrate-to-cryptohoru.sh
```

---

## Running the Script

### Step 1: Connect to Your VPS

```bash
ssh root@softsace.com
```

### Step 2: Make Script Executable

```bash
cd /root
chmod +x migrate-to-cryptohoru.sh
```

### Step 3: Run the Script

```bash
bash migrate-to-cryptohoru.sh
```

Or:

```bash
./migrate-to-cryptohoru.sh
```

---

## What to Expect

### The script will ask you:

1. **Confirmation to proceed:**
   ```
   ⚡ IMPORTANT: This will REPLACE your existing website on softsace.com
   Do you want to continue? (yes/no):
   ```
   Type: `yes`

2. **MongoDB URI:**
   ```
   MongoDB URI (from MongoDB Atlas):
   ```
   Paste your connection string

3. **AUTH_SECRET:**
   ```
   AUTH_SECRET (paste generated secret):
   ```
   Paste the secret you generated with `openssl rand -base64 32`

4. **SSL Certificate setup:**
   ```
   Do you want to setup/renew SSL certificate for softsace.com? (yes/no):
   ```
   Type: `yes` (recommended)

5. **Email for SSL:**
   ```
   Enter your email address for SSL notifications:
   ```
   Type your email

---

## Expected Output

You'll see colored output like this:

```
========================================
CryptoHoru Migration Script
========================================

Domain: softsace.com
Target Directory: /var/www/cryptohoru
Backup Location: /root/backups/20251013_120530

✓ Running as root

⚡ IMPORTANT: This will REPLACE your existing website on softsace.com

Do you want to continue? (yes/no): yes

========================================
STEP 1: Backing Up Existing Website
========================================

✓ Created backup directory: /root/backups/20251013_120530
=> Backing up /var/www...
✓ Website files backed up
=> Backing up Nginx configurations...
✓ Nginx configs backed up
✓ Backup completed

[... continues through all steps ...]

========================================
STEP 12: Final Verification
========================================

✓ Migration completed successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Installation Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Domain:       https://softsace.com
  Directory:    /var/www/cryptohoru
  Node.js:      v20.19.1
  npm:          10.9.2
  PM2:          v5.4.3
  Backup:       /root/backups/20251013_120530

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ CryptoHoru is now live on softsace.com!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## After Migration

### 1. Create Admin User

On your **LOCAL Kali machine**:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourStrongPassword123!', 12))"
```

Copy the output (starts with `$2a$12$...`)

Then:
1. Go to: https://cloud.mongodb.com
2. Browse Collections → `cryptohoru` database → `users` collection
3. Click "INSERT DOCUMENT"
4. Switch to "JSON" view
5. Paste:

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

6. Click "Insert"

### 2. Test Your Website

Open in browser:
- **Homepage:** https://softsace.com
- **Sign In:** https://softsace.com/auth/signin
- **Admin Panel:** https://softsace.com/admin

### 3. Verify Everything Works

- [ ] Homepage loads
- [ ] Can sign up as user
- [ ] Can sign in as admin
- [ ] Admin panel accessible
- [ ] Can create airdrops
- [ ] All pages work

---

## Useful Commands

After migration, use these commands on your VPS:

```bash
# Check application status
pm2 status

# View application logs
pm2 logs cryptohoru

# Restart application
pm2 restart cryptohoru

# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# View Nginx error logs
tail -f /var/log/nginx/error.log

# Check what's running on port 3000
lsof -i :3000

# Check firewall status
ufw status
```

---

## Deploying Updates

When you make changes locally:

### On Local Machine (Kali):

```bash
cd /home/nilesh/Desktop/cryptohoruweb
# Make your changes
git add .
git commit -m "Your update message"
git push origin main
```

### On VPS (softsace.com):

```bash
ssh root@softsace.com
cd /var/www/cryptohoru
git pull origin main
npm install
npm run build
pm2 restart cryptohoru
```

### Quick Deploy Script

Create a deploy script on your VPS:

```bash
# On VPS
nano /var/www/cryptohoru/deploy.sh
```

Add:
```bash
#!/bin/bash
echo "🚀 Deploying..."
cd /var/www/cryptohoru
git pull origin main
npm install
npm run build
pm2 restart cryptohoru
echo "✅ Deployed!"
pm2 logs cryptohoru --lines 10
```

Make executable:
```bash
chmod +x /var/www/cryptohoru/deploy.sh
```

Deploy with one command:
```bash
/var/www/cryptohoru/deploy.sh
```

---

## Troubleshooting

### Script fails at Node.js installation:

```bash
# Manually remove old Node.js
apt remove -y nodejs npm libnode* node-*
apt autoremove -y
apt clean

# Run script again
bash migrate-to-cryptohoru.sh
```

### Build fails:

```bash
# Clear cache and rebuild
cd /var/www/cryptohoru
rm -rf .next node_modules package-lock.json
npm install
npm run build
pm2 restart cryptohoru
```

### Site shows 502 Bad Gateway:

```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs cryptohoru

# Restart
pm2 restart cryptohoru
```

### SSL certificate issues:

```bash
# Renew certificate
certbot renew

# Or get new certificate
certbot --nginx -d softsace.com -d www.softsace.com
```

### MongoDB connection failed:

```bash
# Check environment file
cat /var/www/cryptohoru/.env.local

# Verify connection string is correct
# Check MongoDB Atlas network access (0.0.0.0/0)
```

---

## Backup Location

Your old website is backed up at:
```
/root/backups/[DATE_TIME]/
```

To restore old backup (if needed):
```bash
# List backups
ls -la /root/backups/

# Restore files (replace DATE_TIME)
cp -r /root/backups/DATE_TIME/www/* /var/www/
```

---

## Important Notes

⚠️ **This script will:**
- Stop all PM2 processes
- Remove all Nginx site configurations
- Replace everything in /var/www/cryptohoru

✅ **It will NOT:**
- Delete system files
- Remove other services
- Touch databases

💾 **Backup:**
- All backups are in `/root/backups/`
- Keep these for at least 30 days

---

## Need Help?

If you encounter issues:

1. **Check the logs:**
   ```bash
   pm2 logs cryptohoru
   tail -f /var/log/nginx/error.log
   ```

2. **Verify services:**
   ```bash
   pm2 status
   systemctl status nginx
   ```

3. **Check ports:**
   ```bash
   lsof -i :3000
   lsof -i :80
   ```

4. **Test Nginx:**
   ```bash
   nginx -t
   ```

---

## Success Checklist

After running the script:

- [ ] Script completed without errors
- [ ] Can access https://softsace.com
- [ ] Homepage loads correctly
- [ ] PM2 shows cryptohoru running
- [ ] Nginx is active and running
- [ ] Firewall allows ports 22, 80, 443
- [ ] Admin user created in MongoDB
- [ ] Can login as admin
- [ ] Admin panel accessible
- [ ] Can create airdrops

---

**You're all set! Your CryptoHoru platform is now live on softsace.com! 🚀**
