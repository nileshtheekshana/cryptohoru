# 🚀 Deploy CryptoHoru to Brand New VPS - Complete Guide

## ✅ What You Have
- ✅ Brand new VPS
- ✅ Code on GitHub: https://github.com/nileshtheekshana/cryptohoru
- ✅ Domain: softsace.com

---

## 📋 What You Need Before Starting

### 1. MongoDB Atlas Connection String

If you don't have it yet, follow this quick setup:

1. Go to: https://cloud.mongodb.com
2. Sign up (free)
3. Create a cluster (M0 FREE tier)
4. Create database user with password
5. Allow access from anywhere (0.0.0.0/0)
6. Get connection string - looks like:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/cryptohoru?retryWrites=true&w=majority
   ```

### 2. VPS Details You'll Need
- IP address
- Root password
- SSH access

---

## 🎯 PART 1: Connect to Your VPS

### Step 1: SSH into VPS

```bash
# On your LOCAL Kali machine terminal:
ssh root@YOUR_VPS_IP
```

**Example:**
```bash
ssh root@165.232.123.45
```

Enter your password when prompted.

---

## 🛠️ PART 2: Setup VPS (Run these commands one by one)

### Step 1: Update System

```bash
apt update && apt upgrade -y
```

### Step 2: Install Essential Tools

```bash
apt install -y curl wget git build-essential ufw lsof
```

### Step 3: Install Node.js 20

```bash
# Download NodeSource setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 4: Install PM2 (Process Manager)

```bash
npm install -g pm2

# Verify
pm2 --version
```

### Step 5: Install Nginx (Web Server)

```bash
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
# Press 'q' to exit
```

### Step 6: Configure Firewall

```bash
# Install UFW (if not already installed)
apt install -y ufw

# Allow SSH (IMPORTANT: Do this FIRST!)
ufw allow 22

# Allow HTTP
ufw allow 80

# Allow HTTPS
ufw allow 443

# Enable firewall
ufw enable
# Type 'y' and press Enter

# Check status
ufw status
```

---

## 📦 PART 3: Deploy Your Application

### Step 1: Clone Your Repository

```bash
# Create directory
mkdir -p /var/www
cd /var/www

# Clone from GitHub (notice the dot at the end!)
git clone https://github.com/nileshtheekshana/cryptohoru.git cryptohoru

# Enter directory
cd cryptohoru

# Verify files (you should see package.json, app/, etc.)
ls -la
```

**⚠️ Common Issue:** If you see double directories like `/var/www/cryptohoru/cryptohoru/`, you can fix it:

```bash
# If you have double directory, fix it:
cd /var/www
rm -rf cryptohoru
git clone https://github.com/nileshtheekshana/cryptohoru.git cryptohoru
cd cryptohoru
ls -la  # Should now see package.json directly
```

### Step 2: Create Environment File

```bash
nano .env.local
```

**Copy and paste this (replace with YOUR values):**

```bash
# MongoDB Connection String (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/cryptohoru?retryWrites=true&w=majority

# Generate on LOCAL Kali machine with: openssl rand -base64 32
AUTH_SECRET=PASTE_YOUR_GENERATED_SECRET_HERE

# Your domain (we'll update after SSL)
NEXTAUTH_URL=http://softsace.com

# Environment
NODE_ENV=production
PORT=3000
```

**To generate AUTH_SECRET:**

Open a **NEW terminal on your LOCAL Kali machine** and run:
```bash
openssl rand -base64 32
```

Copy the output and paste it in the .env.local file above.

**Save the file:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### Step 3: Install Dependencies

```bash
npm install
```

**This will take 2-3 minutes. Wait for it to complete.**

### Step 4: Build the Application

```bash
npm run build
```

**This will take 2-3 minutes. Wait for "Compiled successfully" message.**

### Step 5: Start with PM2

```bash
# Start the application
pm2 start npm --name "cryptohoru" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# IMPORTANT: Copy the command it shows and run it
```

**Check if running:**
```bash
pm2 status
pm2 logs cryptohoru
# Press Ctrl+C to exit logs
```

---

## 🌐 PART 4: Configure Nginx

### Step 1: Remove Default Site

```bash
rm /etc/nginx/sites-enabled/default
```

### Step 2: Create New Configuration

```bash
nano /etc/nginx/sites-available/cryptohoru
```

**Copy and paste this:**

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name softsace.com www.softsace.com;
    
    # Redirect www to non-www
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
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 3: Enable Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/cryptohoru /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# If test passes, restart Nginx
systemctl restart nginx
```

---

## 🔒 PART 5: Setup SSL Certificate (HTTPS)

### Step 1: Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### Step 2: Get SSL Certificate

```bash
certbot --nginx -d softsace.com -d www.softsace.com
```

**Follow the prompts:**
1. Enter your email address
2. Type `Y` to agree to terms
3. Type `N` for sharing email (optional)
4. Type `2` to redirect HTTP to HTTPS

### Step 3: Update Environment for HTTPS

```bash
nano /var/www/cryptohoru/.env.local
```

**Change this line:**
```
NEXTAUTH_URL=http://softsace.com
```

**To:**
```
NEXTAUTH_URL=https://softsace.com
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 4: Restart Application

```bash
pm2 restart cryptohoru
```

---

## 🎉 PART 6: Create Admin User

### Step 1: Generate Password Hash

**On your LOCAL Kali machine** (open new terminal):

```bash
node -e "console.log(require('bcryptjs').hashSync('YourAdminPassword123!', 12))"
```

**Copy the long hash** (starts with `$2a$12$...`)

### Step 2: Insert Admin User in MongoDB

**Easiest Way - Create Through Website:**

Just go to your website and create a regular account, then change it to admin:

1. Open your website: `http://YOUR_VPS_IP/auth/signup` (or `https://cryptohoru.com/auth/signup`)
2. Fill the signup form:
   - Name: Admin
   - Email: admin@cryptohoru.com
   - Password: YourPassword123!
3. Click "Sign Up"
4. Now go to MongoDB Atlas: **https://cloud.mongodb.com**
5. Sign in to your MongoDB account
6. Click **"Browse Collections"** (green button on the left)
7. You'll see your database. Click on **"cryptohoru"** database
8. Click on **"users"** collection
9. Find your newly created user (the one with admin@cryptohoru.com)
10. Click the **pencil icon** (Edit) next to that user
11. Find the line that says: `"role": "user"`
12. Change it to: `"role": "admin"`
13. Click **"Update"** button at the bottom
14. Done! Now log out and log back in - you'll see "Admin Panel" button!

---

**Alternative Way - Manual Insert (Advanced):**

If you prefer to insert directly into MongoDB:

1. Go to: **https://cloud.mongodb.com**
2. Click **"Browse Collections"** (green button)
3. Select **"cryptohoru"** database
4. Select **"users"** collection
5. Click **"INSERT DOCUMENT"** button (top right)
6. Click **"{}"** to switch to JSON view (top left corner)
7. Delete everything and paste this (replace the password hash):

```json
{
  "name": "Admin",
  "email": "admin@cryptohoru.com",
  "password": "$2a$12$YOUR_HASHED_PASSWORD_HERE",
  "role": "admin",
  "completedTasks": [],
  "followedAirdrops": [],
  "createdAt": {"$date": "2025-10-14T00:00:00.000Z"},
  "updatedAt": {"$date": "2025-10-14T00:00:00.000Z"}
}
```

**To get the password hash, run this on your VPS:**
```bash
cd /var/www/cryptohoru
node -e "console.log(require('bcryptjs').hashSync('YourPassword123!', 12))"
```

Copy the output (looks like: `$2a$12$abc123xyz...`) and replace `$2a$12$YOUR_HASHED_PASSWORD_HERE` with it.

8. Click **"Insert"** button

---

## ✅ PART 7: Test Your Website

### Open in browser:

1. **Homepage:** https://softsace.com
2. **Sign In:** https://softsace.com/auth/signin
3. **Admin Panel:** https://softsace.com/admin (login first)

### Test Admin Login:

- Email: `admin@softsace.com`
- Password: `YourAdminPassword123!` (or whatever you used)

You should see "Admin Panel" button in the navbar!

---

## 🔄 PART 8: Deploy Updates (Future Changes)

### When you make changes locally:

**On LOCAL machine:**

```bash
cd /home/nilesh/Desktop/cryptohoruweb

# Make your changes, then:
git add .
git commit -m "Your update message"
git push origin main
```

**On VPS:**

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

### Quick Deploy Script (Optional)

Create this for one-command updates:

```bash
nano /var/www/cryptohoru/deploy.sh
```

**Add:**

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

**Make executable:**

```bash
chmod +x /var/www/cryptohoru/deploy.sh
```

**Use it:**

```bash
/var/www/cryptohoru/deploy.sh
```

---

## 🆘 Troubleshooting

### Site not loading?

```bash
# Check PM2
pm2 status
pm2 logs cryptohoru

# Check Nginx
systemctl status nginx
nginx -t

# Check firewall
ufw status
```

### MongoDB connection error?

```bash
# Check .env.local file
cat /var/www/cryptohoru/.env.local

# Test connection string
# Make sure password is correct and IP 0.0.0.0/0 is allowed in MongoDB Atlas
```

### Build errors?

```bash
cd /var/www/cryptohoru
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Port 3000 already in use?

```bash
# Find what's using it
lsof -i :3000

# Kill it (replace PID)
kill -9 PID

# Restart app
pm2 restart cryptohoru
```

---

## 📊 Useful Commands Reference

### PM2 Commands:

```bash
pm2 list                 # Show all processes
pm2 logs cryptohoru      # View logs
pm2 restart cryptohoru   # Restart app
pm2 stop cryptohoru      # Stop app
pm2 monit                # Monitor resources
```

### Nginx Commands:

```bash
systemctl status nginx   # Check status
nginx -t                 # Test config
systemctl restart nginx  # Restart Nginx
systemctl reload nginx   # Reload config
```

### Check Logs:

```bash
# Application logs
pm2 logs cryptohoru

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

---

## 🎯 Complete Checklist

After following this guide:

- [ ] VPS setup complete
- [ ] Node.js 20 installed
- [ ] PM2 installed
- [ ] Nginx installed and configured
- [ ] Firewall configured (UFW)
- [ ] Code cloned from GitHub
- [ ] .env.local created with correct values
- [ ] Dependencies installed
- [ ] Application built
- [ ] PM2 running the app
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Admin user created in MongoDB
- [ ] Can access https://softsace.com
- [ ] Can login as admin
- [ ] Admin panel accessible

---

## 📝 Summary

**Your Stack:**
- **Server:** Your VPS
- **Code:** GitHub → https://github.com/nileshtheekshana/cryptohoru
- **Database:** MongoDB Atlas (free tier)
- **Runtime:** Node.js 20
- **Process Manager:** PM2
- **Web Server:** Nginx
- **SSL:** Let's Encrypt (free)

**Total Setup Time:** ~30-45 minutes

**Update Time:** ~30 seconds

---

## 🚀 Next Steps

1. **Test everything** - Create airdrops, test user signup
2. **Customize content** - Add your real airdrop data
3. **Share your site** - Start promoting!
4. **Regular backups** - Keep your data safe

---

**Your CryptoHoru platform is now LIVE at https://softsace.com! 🎉**

Need help? Check the logs first:
```bash
pm2 logs cryptohoru
```

Good luck! 🚀
