# ✅ Hosting Checklist - Quick Reference

Print this or keep it open while hosting!

---

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub ✅ (You're here!)
- [ ] Local development working (`npm run dev`)
- [ ] `.env.local` in `.gitignore` (verified)

---

## Step 1: MongoDB Atlas (10 min)

- [ ] Created account at mongodb.com/cloud/atlas
- [ ] Created FREE M0 cluster
- [ ] Created database user (saved credentials)
- [ ] Set network access to 0.0.0.0/0
- [ ] Copied connection string
- [ ] Replaced `<password>` and added `/cryptohoru`
- [ ] **Saved connection string somewhere safe!**

**Connection string format:**
```
mongodb+srv://username:password@cluster.mongodb.net/cryptohoru?retryWrites=true&w=majority
```

---

## Step 2: Get VPS (5 min)

**Choose provider:**
- [ ] DigitalOcean ($6/mo) - Recommended
- [ ] Linode ($5/mo)
- [ ] Vultr ($5/mo)
- [ ] Other

**VPS specs:**
- [ ] Ubuntu 22.04 LTS
- [ ] 1GB RAM minimum
- [ ] 1 vCPU
- [ ] 25GB SSD

**Saved details:**
```
IP: ___________________
User: root
Password: ___________________
```

---

## Step 3: Configure VPS (20 min)

### Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

### Run these commands in order:

- [ ] `apt update && apt upgrade -y`
- [ ] `apt install -y curl wget git build-essential ufw`
- [ ] `curl -fsSL https://deb.nodesource.com/setup_20.x | bash -`
- [ ] `apt install -y nodejs`
- [ ] Verify: `node --version` (should be v20.x.x)
- [ ] `npm install -g pm2`
- [ ] `apt install -y nginx`
- [ ] `systemctl start nginx && systemctl enable nginx`
- [ ] `ufw allow 22 && ufw allow 80 && ufw allow 443`
- [ ] `ufw enable` (type 'y')

### Test Nginx
- [ ] Open browser: `http://YOUR_VPS_IP`
- [ ] Should see Nginx welcome page

---

## Step 4: Deploy Application (15 min)

### Clone & Setup
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/nileshtheekshana/cryptohoru.git
cd cryptohoru
npm install
```

### Create .env.local
```bash
nano .env.local
```

**Add (replace values):**
```
MONGODB_URI=your-mongodb-connection-string-from-step-1
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://YOUR_VPS_IP:3000
NODE_ENV=production
PORT=3000
```

**Generate AUTH_SECRET on Kali:**
```bash
# Run on LOCAL machine:
openssl rand -base64 32
```

- [ ] Saved .env.local file
- [ ] Verified all values are correct

### Build & Start
```bash
npm run build
pm2 start npm --name "cryptohoru" -- start
pm2 save
pm2 startup
```

- [ ] Copy and run the command from `pm2 startup`
- [ ] `pm2 status` shows app running
- [ ] Test: `http://YOUR_VPS_IP:3000` loads

---

## Step 5: Configure Nginx (10 min)

### Create Nginx config
```bash
nano /etc/nginx/sites-available/cryptohoru
```

**Paste this (replace YOUR_VPS_IP):**
```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable & test
```bash
ln -s /etc/nginx/sites-available/cryptohoru /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Update environment
```bash
nano /var/www/cryptohoru/.env.local
```

**Change to:**
```
NEXTAUTH_URL=http://YOUR_VPS_IP
```

```bash
pm2 restart cryptohoru
```

- [ ] Test: `http://YOUR_VPS_IP` (no port!) loads

---

## Step 6: Create Admin User (5 min)

### Generate password hash (on Kali)
```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword', 12))"
```

- [ ] Copied hash (starts with `$2a$12$`)

### Add to MongoDB Atlas

1. [ ] Go to MongoDB Atlas website
2. [ ] Click "Browse Collections"
3. [ ] Database: `cryptohoru`
4. [ ] Create collection: `users`
5. [ ] Click "INSERT DOCUMENT"
6. [ ] Switch to JSON view
7. [ ] Paste:

```json
{
  "name": "Admin",
  "email": "admin@youremail.com",
  "password": "YOUR_HASHED_PASSWORD",
  "role": "admin",
  "completedTasks": [],
  "followedAirdrops": [],
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

8. [ ] Click "Insert"

---

## Step 7: Test Everything

- [ ] Homepage: `http://YOUR_VPS_IP` ✅
- [ ] Sign in: `http://YOUR_VPS_IP/auth/signin` ✅
- [ ] Login with admin credentials ✅
- [ ] Admin panel button visible in navbar ✅
- [ ] Can access `/admin` ✅
- [ ] Can create airdrop ✅
- [ ] Check MongoDB - data appears ✅

---

## 🎉 YOU'RE LIVE!

Your app is now hosted at: `http://YOUR_VPS_IP`

---

## Optional: Add Domain & SSL

### Get Domain
- [ ] Bought domain or using free service
- [ ] Domain: ____________________

### Configure DNS
In domain registrar:
- [ ] A Record: `@` → `YOUR_VPS_IP`
- [ ] A Record: `www` → `YOUR_VPS_IP`
- [ ] Wait 15 minutes for propagation

### Update Nginx
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

```bash
nginx -t && systemctl restart nginx
```

### Install SSL (HTTPS)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

- [ ] Entered email
- [ ] Agreed to terms
- [ ] Chose redirect to HTTPS

### Update .env.local
```bash
nano /var/www/cryptohoru/.env.local
```

**Change to:**
```
NEXTAUTH_URL=https://yourdomain.com
```

```bash
pm2 restart cryptohoru
```

- [ ] Test: `https://yourdomain.com` with HTTPS ✅

---

## 🔄 Daily Update Workflow

### On Kali (local):
```bash
# Make changes
git add .
git commit -m "Update message"
git push origin main
```

### On VPS:
```bash
ssh root@YOUR_VPS_IP
cd /var/www/cryptohoru
git pull origin main
npm install
npm run build
pm2 restart cryptohoru
```

**Or use deploy script:**
```bash
/var/www/cryptohoru/deploy.sh
```

---

## 📞 Quick Commands

```bash
# View logs
pm2 logs cryptohoru

# Restart app
pm2 restart cryptohoru

# Check status
pm2 status

# Nginx status
systemctl status nginx

# Restart Nginx
systemctl restart nginx

# Check firewall
ufw status
```

---

## 🆘 Common Issues

**App won't start?**
```bash
pm2 logs cryptohoru --lines 50
```

**Site not loading?**
```bash
pm2 restart cryptohoru
systemctl restart nginx
```

**MongoDB error?**
- Check connection string in .env.local
- Verify MongoDB Atlas network access

**Can't login?**
- Check user exists in MongoDB
- Verify role is "admin"
- Clear browser cookies

---

## 💰 Costs

- MongoDB Atlas: FREE ✅
- VPS: $5-6/month
- Domain: $10/year (optional)
- SSL: FREE ✅

**Total: ~$5-6/month**

---

## ✅ Success!

**Your CryptoHoru platform is LIVE!** 🎉

Share this URL: `http://YOUR_VPS_IP` (or your domain)

---

**Need help?** Check HOSTING_GUIDE.md for detailed instructions!
