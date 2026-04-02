# 📥 Download Your Python Program from VPS

## Your Python Program Location
**VPS Path:** `/root/finalbot`

---

## Method 1: SCP (Recommended - Easiest)

### Download the entire directory:

```bash
# On your LOCAL Kali machine, open terminal:
cd ~/Desktop
scp -r root@softsace.com:/root/finalbot ./finalbot_backup
```

**Explanation:**
- `-r` = recursive (copies entire directory with all files)
- Downloads to: `/home/nilesh/Desktop/finalbot_backup`

---

## Method 2: Create Archive First (Faster for large files)

### Step 1: Create archive on VPS

```bash
# SSH into VPS:
ssh root@softsace.com

# Create compressed archive:
cd /root
tar -czf finalbot_backup.tar.gz finalbot/

# Check file size:
ls -lh finalbot_backup.tar.gz

# Exit VPS:
exit
```

### Step 2: Download the archive

```bash
# On your LOCAL Kali machine:
cd ~/Desktop
scp root@softsace.com:/root/finalbot_backup.tar.gz ./

# Extract it:
tar -xzf finalbot_backup.tar.gz
```

---

## Method 3: Using rsync (Preserves everything)

```bash
# On your LOCAL Kali machine:
cd ~/Desktop
rsync -avz --progress root@softsace.com:/root/finalbot/ ./finalbot_backup/
```

**Benefits:**
- Shows progress
- Preserves permissions, timestamps
- Can resume if interrupted

---

## Method 4: Download specific files only

### If you only need certain files:

```bash
# Download just the Python files:
scp root@softsace.com:/root/finalbot/*.py ~/Desktop/finalbot_backup/

# Download specific file:
scp root@softsace.com:/root/finalbot/main.py ~/Desktop/

# Download config files:
scp root@softsace.com:/root/finalbot/config.json ~/Desktop/finalbot_backup/
scp root@softsace.com:/root/finalbot/.env ~/Desktop/finalbot_backup/
```

---

## After Downloading

### Verify the download:

```bash
# Check if files are there:
ls -lah ~/Desktop/finalbot_backup/

# Count files:
find ~/Desktop/finalbot_backup/ -type f | wc -l
```

### Check what's inside:

```bash
# View directory structure:
tree ~/Desktop/finalbot_backup/

# Or if tree is not installed:
ls -R ~/Desktop/finalbot_backup/
```

---

## Quick Reference Commands

### 1. First, check what's in the directory on VPS:

```bash
ssh root@softsace.com "ls -lah /root/finalbot/"
```

### 2. Check the size:

```bash
ssh root@softsace.com "du -sh /root/finalbot/"
```

### 3. Download it:

```bash
# Fastest method:
cd ~/Desktop
scp -r root@softsace.com:/root/finalbot ./finalbot_backup
```

---

## Complete Step-by-Step Example

Here's the complete process:

```bash
# 1. Open terminal on your LOCAL Kali machine
# 2. Go to Desktop
cd ~/Desktop

# 3. Check what's in the directory first (optional)
ssh root@softsace.com "ls -lah /root/finalbot/"

# 4. Download the entire directory
scp -r root@softsace.com:/root/finalbot ./finalbot_backup

# 5. Verify download
ls -lah finalbot_backup/

# 6. Check if Python files are there
ls finalbot_backup/*.py
```

---

## If You Want to Keep It on VPS Too

The migration script will NOT delete `/root/finalbot` because:
- It only affects `/var/www/` directory
- Your Python bot in `/root/` will remain untouched

So you can:
1. Download it for safekeeping (recommended)
2. Let it continue running on the VPS alongside CryptoHoru
3. Both can run simultaneously

---

## If Your Python Bot Uses Port 3000

If your finalbot also uses port 3000, you'll need to:

### Check what port it uses:

```bash
ssh root@softsace.com
cd /root/finalbot
grep -r "port" .
grep -r "3000" .
```

### Options:

**Option A:** Change CryptoHoru to use port 3001
- Modify the migration script: `APP_PORT="3001"`

**Option B:** Change finalbot to use different port
- Edit finalbot config after backing up

**Option C:** Run finalbot on different domain/subdomain
- Keep finalbot on: `bot.softsace.com`
- CryptoHoru on: `softsace.com`

---

## Want to Download Other Important Files?

### Download your entire /root folder:

```bash
cd ~/Desktop
scp -r root@softsace.com:/root ./vps_root_backup
```

### Download Nginx configs:

```bash
mkdir -p ~/Desktop/vps_backup
scp -r root@softsace.com:/etc/nginx/sites-available ~/Desktop/vps_backup/
```

### Download all Python projects:

```bash
ssh root@softsace.com "find /root /var/www /opt -name '*.py' -type f" > ~/Desktop/python_files_list.txt
```

---

## Need Help?

If the download fails:

### Check SSH connection:

```bash
ssh root@softsace.com "echo 'Connection OK'"
```

### Check if path exists:

```bash
ssh root@softsace.com "test -d /root/finalbot && echo 'Directory exists' || echo 'Directory not found'"
```

### Check permissions:

```bash
ssh root@softsace.com "ls -ld /root/finalbot"
```

---

## 🚀 Ready to Proceed?

After downloading your finalbot:

1. ✅ Your Python bot is safely backed up on local machine
2. ✅ You can proceed with CryptoHoru migration
3. ✅ Both can run together on the VPS (if they use different ports)

### Next step - Run the migration:

```bash
# Upload migration script:
cd /home/nilesh/Desktop/cryptohoruweb
scp migrate-to-cryptohoru.sh root@softsace.com:/root/

# SSH and run it:
ssh root@softsace.com
chmod +x /root/migrate-to-cryptohoru.sh
bash /root/migrate-to-cryptohoru.sh
```

---

**Your finalbot will remain safe in `/root/finalbot/` even after migration! 🎉**
