# 🔍 Find Your Python Program - Step by Step Guide

## Quick Start

### Step 1: Upload the Backup Script to Your VPS

**Option A: Using SCP (Easiest)**

```bash
# On your LOCAL Kali machine:
cd /home/nilesh/Desktop/cryptohoruweb
scp find-and-backup.sh root@softsace.com:/root/
```

**Option B: Manual Copy-Paste**

1. SSH into your VPS:
   ```bash
   ssh root@softsace.com
   ```

2. Create the script:
   ```bash
   nano /root/find-and-backup.sh
   ```

3. Copy all content from `find-and-backup.sh`
4. Paste into nano
5. Save: `Ctrl+X`, `Y`, `Enter`

---

### Step 2: Run the Backup Script

```bash
# Make it executable
chmod +x /root/find-and-backup.sh

# Run it
bash /root/find-and-backup.sh
```

---

## What the Script Does

✅ **Finds all Python files** on your VPS  
✅ **Shows running Python processes**  
✅ **Lists PM2 processes**  
✅ **Checks common directories** (/var/www, /home, /root, /opt)  
✅ **Creates full backup** of everything  
✅ **Shows you where your Python program is**  

---

## Expected Output

The script will show you:

```
========================================
Finding Python Programs
========================================

Python files found:
/var/www/my-python-app/app.py
/home/user/project/main.py
/opt/my-service/server.py

Python processes currently running:
root  1234  0.1  2.3  /usr/bin/python3 /var/www/my-python-app/app.py

PM2 processes:
┌─────┬──────┬─────────┬───────┐
│ id  │ name │ status  │ cpu   │
├─────┼──────┼─────────┼───────┤
│ 0   │ app  │ online  │ 0.3%  │
└─────┴──────┴─────────┴───────┘
```

---

## After Running the Script

### 1. **Review the Output**

Look for your Python program location in the output.

### 2. **Check the Backup**

```bash
# View backup contents
ls -lah /root/backups/full_backup_*/

# Check specific directories
ls -lah /root/backups/full_backup_*/var_www/
ls -lah /root/backups/full_backup_*/home/
ls -lah /root/backups/full_backup_*/root_files/
```

### 3. **Download Backup to Your Local Machine (Optional)**

```bash
# On your LOCAL Kali machine:
scp -r root@softsace.com:/root/backups/full_backup_* ~/Downloads/
```

---

## Common Python Program Locations

Check these directories (the script checks them automatically):

```bash
/var/www/          # Web applications
/home/*/           # User home directories
/root/             # Root's home directory
/opt/              # Optional software
/srv/              # Service data
```

---

## After Finding Your Python Program

### Option 1: Keep it Running (Recommended)

If you want to keep your Python program running alongside CryptoHoru:

1. The migration script won't touch files outside `/var/www/cryptohoru`
2. Your Python program will continue running
3. Both can run on the same VPS

### Option 2: Move it to Another Port

If both use port 3000:

```bash
# Edit your Python program to use different port (e.g., 5000)
# Then update Nginx config to serve both:

# CryptoHoru on: softsace.com
# Python app on: app.softsace.com (subdomain)
```

### Option 3: Stop it Temporarily

```bash
# If using PM2:
pm2 stop <app-name>

# If using systemd:
systemctl stop <service-name>

# Manual process:
kill <PID>
```

---

## Quick Commands Reference

### Find Python files:
```bash
find / -name "*.py" -type f 2>/dev/null | grep -v "/usr/"
```

### Check running Python processes:
```bash
ps aux | grep python
```

### Check PM2:
```bash
pm2 list
pm2 logs
```

### Check systemd services:
```bash
systemctl list-units --type=service | grep python
```

### Check what's on port 3000:
```bash
lsof -i :3000
netstat -tulpn | grep :3000
```

---

## Ready to Migrate?

Once you've backed up everything and know where your Python program is:

### Upload Migration Script:

```bash
# On LOCAL Kali machine:
cd /home/nilesh/Desktop/cryptohoruweb
scp migrate-to-cryptohoru.sh root@softsace.com:/root/
```

### Run Migration:

```bash
# On VPS:
ssh root@softsace.com
chmod +x /root/migrate-to-cryptohoru.sh
bash /root/migrate-to-cryptohoru.sh
```

---

## Emergency: Restore from Backup

If something goes wrong:

```bash
# Extract backup
cd /root/backups
tar -xzf full_backup_*.tar.gz

# Restore specific files
cp -r full_backup_*/var_www/* /var/www/
cp -r full_backup_*/nginx/* /etc/nginx/

# Restart services
systemctl restart nginx
pm2 resurrect
```

---

## Need Help?

If you can't find your Python program:

1. **Check currently running processes:**
   ```bash
   ps aux | grep python
   ```

2. **Check the PID and see the command:**
   ```bash
   ps -p <PID> -o cmd=
   ```

3. **Find the working directory:**
   ```bash
   pwdx <PID>
   ```

4. **See full process tree:**
   ```bash
   pstree -p | grep python
   ```

---

**🚀 You're ready! Run the backup script first, then proceed with migration.**
