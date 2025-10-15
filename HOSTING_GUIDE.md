# 🚀 Complete Hosting Guide - Step by Step

## ✅ Where You Are Now
- [x] Code pushed to GitHub ✅
- [x] Git repository configured ✅
- [x] Ready to deploy! 🚀

---

## 🎯 Next Steps Overview

1. **Setup MongoDB Atlas** (Free database) - 10 minutes
2. **Get a VPS** (Your server) - 5 minutes
3. **Configure VPS** (Install software) - 20 minutes
4. **Deploy Application** (Upload & run) - 15 minutes
5. **Setup Domain & SSL** (Optional but recommended) - 10 minutes

**Total Time: ~60 minutes**

---

## 📦 STEP 1: Setup MongoDB Atlas (Database)

### Why MongoDB Atlas?
- Free tier available (512 MB)
- Cloud-hosted (no maintenance)
- Global availability
- Perfect for your use case

### 1.1 Create Account

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up (free account)
3. Verify your email

### 1.2 Create Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select cloud provider: **AWS** (recommended)
4. Select region: **Choose closest to you or your VPS location**
5. Cluster Name: **cryptohoru-cluster** (or any name)
6. Click **"Create"**

**Wait 1-3 minutes for cluster to be created**

### 1.3 Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `cryptohoru_admin`
5. Password: Click **"Autogenerate Secure Password"** (save this!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

**Save your credentials:**
- Username: `cryptohoru_admin`
- Password: `[the generated password]`

### 1.4 Configure Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Confirm: **0.0.0.0/0**
5. Click **"Confirm"**

**Note:** For production, you'll add your VPS IP later

### 1.5 Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string

It looks like:
```
mongodb+srv://cryptohoru_admin:<password>@cryptohoru-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<password>` with your actual password
7. Add database name after `.net/`: `cryptohoru`

**Final connection string:**
```
mongodb+srv://cryptohoru_admin:YOUR_PASSWORD@cryptohoru-cluster.xxxxx.mongodb.net/cryptohoru?retryWrites=true&w=majority
```

**Save this! You'll need it soon.**

---

## 🖥️ STEP 2: Get a VPS (Virtual Private Server)

### Recommended VPS Providers

| Provider | Price | RAM | Storage | Notes |
|----------|-------|-----|---------|-------|
| **DigitalOcean** | $6/mo | 1GB | 25GB SSD | Most popular, great docs |
| **Linode (Akamai)** | $5/mo | 1GB | 25GB SSD | Excellent support |
| **Vultr** | $5/mo | 1GB | 25GB SSD | Good performance |
| **Hetzner** | €4/mo | 2GB | 40GB SSD | Best value (Europe) |
| **Contabo** | €5/mo | 4GB | 200GB SSD | Cheap but slower support |

### 2.1 Choose Provider & Create Account

**I recommend DigitalOcean for beginners:**

1. Go to: **https://www.digitalocean.com/**
2. Sign up (you may get $200 credit for 60 days)
3. Verify email and add payment method

### 2.2 Create Droplet (VPS Instance)

1. Click **"Create"** → **"Droplets"**
2. **Choose Region:** Closest to your target audience
   - Example: Singapore, New York, London
3. **Choose Image:** 
   - Distribution: **Ubuntu**
   - Version: **22.04 LTS x64**
4. **Choose Size:**
   - Droplet Type: **Basic**
   - CPU: **Regular**
   - Plan: **$6/month** (1GB RAM, 1 vCPU, 25GB SSD)
5. **Authentication:**
   - Choose: **SSH keys** (more secure) or **Password** (easier)
   - If password: Set a strong root password
6. **Hostname:** `cryptohoru-vps` or `crypto-server`
7. Click **"Create Droplet"**

**Wait 1-2 minutes. You'll get an IP address!**

### 2.3 Note Down Details

After creation, note:
- **IP Address:** `xxx.xxx.xxx.xxx`
- **Username:** `root`
- **Password:** (the one you set)

**Example:**
```
IP: 165.232.123.45
User: root
Password: YourStrongPassword123!
```

---

## 🔧 STEP 3: Configure Your VPS

### 3.1 Connect to VPS via SSH

Open your terminal (you're on Kali, so this is easy!):

```bash
ssh root@YOUR_VPS_IP
```

**Example:**
```bash
ssh root@165.232.123.45
```

- Type `yes` when asked about fingerprint
- Enter your password

You should see: `root@cryptohoru-vps:~#`

### 3.2 Update System

```bash
# Update package list
apt update

# Upgrade packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential ufw
```

### 3.3 Install Node.js 20

```bash
# Download Node.js setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 3.4 Install PM2 (Process Manager)

```bash
npm install -g pm2

# Verify
pm2 --version
```

### 3.5 Install Nginx (Web Server)

```bash
apt install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
# Press 'q' to exit
```

**Test:** Open browser and go to `http://YOUR_VPS_IP` - you should see Nginx welcome page!

### 3.6 Setup Firewall

```bash
# Allow SSH (port 22)
ufw allow 22

# Allow HTTP (port 80)
ufw allow 80

# Allow HTTPS (port 443)
ufw allow 443

# Enable firewall
ufw enable
# Type 'y' to confirm

# Check status
ufw status
```

---

## 📦 STEP 4: Deploy Your Application

### 4.1 Clone Your Repository

```bash
# Create web directory
mkdir -p /var/www
cd /var/www

# Clone from GitHub
git clone https://github.com/nileshtheekshana/cryptohoru.git
cd cryptohoru
```

### 4.2 Install Dependencies

```bash
npm install
```

This will take 2-3 minutes.

### 4.3 Create Environment File

```bash
nano .env.local
```

**Add this content** (replace with your actual values):

```bash
# MongoDB Connection String (from Step 1.5)
MONGODB_URI=mongodb+srv://cryptohoru_admin:YOUR_PASSWORD@cryptohoru-cluster.xxxxx.mongodb.net/cryptohoru?retryWrites=true&w=majority

# Generate AUTH_SECRET by running on LOCAL machine:
# openssl rand -base64 32
AUTH_SECRET=paste-generated-secret-here

# Your VPS IP or domain
NEXTAUTH_URL=http://YOUR_VPS_IP:3000

# Environment
NODE_ENV=production
PORT=3000
```

**To generate AUTH_SECRET on Kali:**
```bash
# Run this on your LOCAL Kali machine (new terminal):
openssl rand -base64 32
# Copy the output
```

**Save the file:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### 4.4 Build Application

```bash
npm run build
```

This creates the optimized production build. Takes 2-3 minutes.

### 4.5 Start with PM2

```bash
# Start the application
pm2 start npm --name "cryptohoru" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it gives you
```

### 4.6 Verify Application is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs cryptohoru

# Press Ctrl+C to exit logs
```

**Test:** Open browser: `http://YOUR_VPS_IP:3000` - Your site should load!

---

## 🌐 STEP 5: Configure Nginx (Reverse Proxy)

Currently your site is at `http://IP:3000`. Let's make it work on port 80 (normal HTTP).

### 5.1 Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/cryptohoru
```

**Add this configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name YOUR_VPS_IP;
    
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

**Replace `YOUR_VPS_IP` with your actual IP!**

**Save:** `Ctrl+X`, `Y`, `Enter`

### 5.2 Enable Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/cryptohoru /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 5.3 Update Environment Variable

```bash
nano /var/www/cryptohoru/.env.local
```

**Change:**
```
NEXTAUTH_URL=http://YOUR_VPS_IP:3000
```

**To:**
```
NEXTAUTH_URL=http://YOUR_VPS_IP
```

**Save and restart:**
```bash
pm2 restart cryptohoru
```

**Test:** Open browser: `http://YOUR_VPS_IP` (no port 3000!) - Should work!

---

## 🎉 STEP 6: Create Admin User

Your app is live! Now create your admin account.

### 6.1 Option A: Via Application (Easiest)

```bash
# On your LOCAL Kali machine, generate password hash:
node -e "console.log(require('bcryptjs').hashSync('YourAdminPassword123!', 12))"
```

Copy the long hash that starts with `$2a$12$...`

### 6.2 Connect to MongoDB and Insert Admin

1. Go to MongoDB Atlas website
2. Click **"Browse Collections"**
3. Database: `cryptohoru`
4. Collection: Create **"users"**
5. Click **"INSERT DOCUMENT"**
6. Switch to **"JSON"** view
7. Paste this (replace with your data):

```json
{
  "name": "Admin",
  "email": "admin@cryptohoru.com",
  "password": "$2a$12$YOUR_HASHED_PASSWORD_HERE",
  "role": "admin",
  "completedTasks": [],
  "followedAirdrops": [],
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

8. Click **"Insert"**

### 6.3 Option B: Sign Up and Update Role

1. Go to `http://YOUR_VPS_IP/auth/signup`
2. Create account
3. In MongoDB Atlas, find the user
4. Change `"role": "user"` to `"role": "admin"`

---

## 🔐 STEP 7: Add Domain & SSL (Optional but Recommended)

### 7.1 Get a Domain (if you don't have one)

**Free options:**
- Freenom.com (free .tk, .ml, .ga domains)
- DuckDNS.org (free subdomain)

**Paid options ($10-12/year):**
- Namecheap.com
- Cloudflare.com
- GoDaddy.com

### 7.2 Point Domain to VPS

In your domain registrar's DNS settings:

1. Add **A Record:**
   - Host: `@` (or leave blank)
   - Value: `YOUR_VPS_IP`
   - TTL: 3600

2. Add **A Record:**
   - Host: `www`
   - Value: `YOUR_VPS_IP`
   - TTL: 3600

**Wait 5-15 minutes for DNS propagation**

### 7.3 Update Nginx for Domain

```bash
nano /etc/nginx/sites-available/cryptohoru
```

**Change:**
```
server_name YOUR_VPS_IP;
```

**To:**
```
server_name yourdomain.com www.yourdomain.com;
```

**Save and restart:**
```bash
nginx -t
systemctl restart nginx
```

### 7.4 Install SSL Certificate (Free HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# 1. Enter email
# 2. Agree to terms: Y
# 3. Share email?: N (optional)
# 4. Redirect HTTP to HTTPS?: 2 (Yes)
```

### 7.5 Update Environment for HTTPS

```bash
nano /var/www/cryptohoru/.env.local
```

**Change:**
```
NEXTAUTH_URL=http://YOUR_VPS_IP
```

**To:**
```
NEXTAUTH_URL=https://yourdomain.com
```

**Save and restart:**
```bash
pm2 restart cryptohoru
```

**Done!** Visit: `https://yourdomain.com` 🎉

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Can access: `http://YOUR_VPS_IP` (or your domain)
- [ ] Homepage loads correctly
- [ ] Can access: `/auth/signin`
- [ ] Can login with admin credentials
- [ ] Admin panel button appears in navbar
- [ ] Can access: `/admin`
- [ ] Can create airdrops in admin panel
- [ ] MongoDB shows data when you create content

---

## 🔄 Making Updates (Your Daily Workflow)

### On Local Machine (Kali):
```bash
cd /home/nilesh/Desktop/cryptohoruweb

# Make changes to your code
# Test locally: npm run dev

# Commit changes
git add .
git commit -m "Added new feature"
git push origin main
```

### On VPS:
```bash
ssh root@YOUR_VPS_IP
cd /var/www/cryptohoru

# Pull changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild
npm run build

# Restart
pm2 restart cryptohoru

# Check logs
pm2 logs cryptohoru
```

**Or create a deployment script:**

```bash
# On VPS, create deploy script:
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
pm2 status
```

Make it executable:
```bash
chmod +x /var/www/cryptohoru/deploy.sh
```

Now deploy with one command:
```bash
/var/www/cryptohoru/deploy.sh
```

---

## 🆘 Troubleshooting

### Site not loading?
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs cryptohoru

# Restart app
pm2 restart cryptohoru

# Check Nginx
systemctl status nginx
nginx -t
```

### MongoDB connection failed?
- Check connection string in `.env.local`
- Verify password is correct
- Check MongoDB Atlas network access (allow 0.0.0.0/0)

### Can't login as admin?
- Verify user exists in MongoDB Atlas
- Check role is set to `"admin"` (not "user")
- Clear browser cookies and try again

### Port 3000 already in use?
```bash
# Find process using port 3000
lsof -i :3000

# Kill it (replace PID)
kill -9 PID

# Restart PM2
pm2 restart cryptohoru
```

### Build failed?
```bash
# Clear cache
cd /var/www/cryptohoru
rm -rf .next node_modules package-lock.json

# Reinstall and rebuild
npm install
npm run build
pm2 restart cryptohoru
```

---

## 📊 Summary

**What you've accomplished:**
1. ✅ MongoDB Atlas database setup
2. ✅ VPS configured with Node.js, PM2, Nginx
3. ✅ Application deployed and running
4. ✅ Reverse proxy configured
5. ✅ Admin user created
6. ✅ (Optional) Domain & SSL setup
7. ✅ Update workflow established

**Your app is LIVE!** 🎉

**Costs:**
- MongoDB Atlas: FREE (M0 tier)
- VPS: $5-6/month
- Domain: $10/year (optional)
- SSL: FREE (Let's Encrypt)

**Total: ~$5-6/month**

---

## 🎯 Next Steps

1. **Test everything** - Create airdrops, test user signup, dashboard
2. **Add content** - Populate with real airdrops
3. **Share with users** - Get feedback
4. **Monitor** - Check `pm2 logs` regularly
5. **Backup** - Git is your backup (push regularly!)

---

Need help with any step? Let me know! 🚀
