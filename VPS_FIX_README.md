# 🔧 VPS Node.js Installation Fix

## Quick Start

### Step 1: Upload the Script to Your VPS

**Option A: Using SCP (from your Kali machine)**
```bash
cd /home/nilesh/Desktop/cryptohoruweb
scp fix-vps-nodejs.sh root@softsace.com:/root/
```

**Option B: Copy-Paste Method**
1. On VPS, create the file:
   ```bash
   nano fix-vps-nodejs.sh
   ```
2. Copy the entire content of `fix-vps-nodejs.sh`
3. Paste into the nano editor
4. Save: `Ctrl+X`, `Y`, `Enter`

**Option C: Download from GitHub (after you push)**
```bash
# On VPS
wget https://raw.githubusercontent.com/nileshtheekshana/cryptohoru/main/fix-vps-nodejs.sh
```

---

### Step 2: Make the Script Executable

```bash
chmod +x fix-vps-nodejs.sh
```

---

### Step 3: Run the Script

```bash
bash fix-vps-nodejs.sh
```

Or:

```bash
./fix-vps-nodejs.sh
```

---

## What This Script Does

✅ **Detects your operating system** (Debian/Ubuntu)

✅ **Removes problematic Docker repositories** that were causing apt update errors

✅ **Removes all old Node.js installations** (including v18.x)

✅ **Cleans apt cache** to ensure fresh installation

✅ **Installs NodeSource repository** for Node.js 20

✅ **Installs Node.js 20.x with npm** (both included!)

✅ **Installs PM2** process manager globally

✅ **Verifies all installations** and shows you the versions

✅ **Provides next steps** for continuing deployment

---

## Expected Output

You should see something like:

```
========================================
STEP 1: Detecting Operating System
========================================

✓ Running as root
✓ Detected: Debian GNU/Linux 12 (bookworm)

========================================
STEP 2: Removing Problematic Repositories
========================================

⚠ Found Docker repository files. Removing...
✓ Removed Docker repository files
✓ No Docker entries in sources.list

========================================
STEP 3: Removing Old Node.js Installations
========================================

⚠ Found Node.js v18.20.4. Removing...
✓ Removed old Node.js installation
✓ Cleaned apt cache

========================================
STEP 4: Updating Package Lists
========================================

=> Running apt update...
✓ Package lists updated successfully

========================================
STEP 5: Installing NodeSource Repository
========================================

=> Downloading NodeSource setup script...
✓ Downloaded NodeSource setup script
=> Running NodeSource setup script...
✓ NodeSource repository configured

========================================
STEP 6: Installing Node.js 20
========================================

=> Installing Node.js and npm...
✓ Node.js installed successfully

========================================
STEP 7: Verifying Installation
========================================

✓ Node.js version: v20.19.1
✓ Node.js 20.x installed correctly!
✓ npm version: 10.9.2

========================================
STEP 8: Installing PM2 Process Manager
========================================

=> Installing PM2 globally...
✓ PM2 installed successfully
✓ PM2 version: 5.4.3

========================================
STEP 9: Final Verification
========================================

✓ All installations completed successfully!

Installed versions:
  Node.js: v20.19.1
  npm:     10.9.2
  PM2:     5.4.3
```

---

## After the Script Completes

Continue with the deployment following **HOSTING_GUIDE.md** from **Step 3.5** (Install Nginx):

```bash
# Install Nginx
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Setup firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# Clone your repository
mkdir -p /var/www
cd /var/www
git clone https://github.com/nileshtheekshana/cryptohoru.git
cd cryptohoru

# Continue with STEP 4 in HOSTING_GUIDE.md
```

---

## Troubleshooting

### If the script fails at "apt update":

1. Check what repositories are causing issues:
   ```bash
   apt update 2>&1 | grep -i "err\|failed"
   ```

2. Manually remove problematic repositories:
   ```bash
   ls /etc/apt/sources.list.d/
   rm -f /etc/apt/sources.list.d/PROBLEMATIC_FILE.list
   ```

3. Run the script again:
   ```bash
   bash fix-vps-nodejs.sh
   ```

### If Node.js is still v18 after running:

```bash
# Remove all Node.js completely
apt purge -y nodejs npm
apt autoremove -y

# Remove NodeSource repository
rm -f /etc/apt/sources.list.d/nodesource.list

# Run the script again
bash fix-vps-nodejs.sh
```

### If npm is not found:

```bash
# This means NodeSource installation failed
# Try manual installation:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

---

## Manual Installation (If Script Fails)

If the script doesn't work, here's the manual method:

```bash
# 1. Remove Docker repos
rm -f /etc/apt/sources.list.d/docker*.list
sed -i '/docker/d' /etc/apt/sources.list

# 2. Remove old Node.js
apt remove -y nodejs npm libnode* node-*
apt autoremove -y
apt clean

# 3. Update
apt update

# 4. Add NodeSource repo
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# 5. Install Node.js
apt install -y nodejs

# 6. Verify
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x

# 7. Install PM2
npm install -g pm2
pm2 --version
```

---

## Quick Commands

### Check current versions:
```bash
node --version
npm --version
pm2 --version
```

### Check what's using port 3000:
```bash
lsof -i :3000
```

### View PM2 processes:
```bash
pm2 list
pm2 logs
```

### Check Nginx status:
```bash
systemctl status nginx
nginx -t
```

---

## Need Help?

If you encounter any issues:

1. **Save the error output** from the script
2. **Check the log files**:
   ```bash
   cat /var/log/apt/term.log
   cat /var/log/apt/history.log
   ```
3. **Share the error** so we can troubleshoot

---

**Good luck with your deployment! 🚀**
