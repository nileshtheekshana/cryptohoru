# 🚀 VPS Deployment - Quick Reference

## One-Time Setup (30-60 min)

```bash
# 1. SSH into VPS
ssh root@your-vps-ip

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone your repo
mkdir -p /var/www/cryptohoru
cd /var/www/cryptohoru
git clone https://github.com/your-username/cryptohoru.git .

# 5. Setup environment
nano .env.local  # Add MONGODB_URI, AUTH_SECRET, NEXTAUTH_URL

# 6. Install & Build
npm install
npm run build

# 7. Start with PM2
pm2 start npm --name "cryptohoru" -- start
pm2 save
pm2 startup  # Follow the command it gives

# 8. Configure Nginx
sudo nano /etc/nginx/sites-available/cryptohoru
# Add proxy config (see DEPLOYMENT_VPS.md)
sudo ln -s /etc/nginx/sites-available/cryptohoru /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Setup SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Daily Workflow (30 seconds)

### On Local Machine:
```bash
# 1. Make changes
# 2. Test with: npm run dev
# 3. Commit and push
git add .
git commit -m "Your update message"
git push origin main
```

### On VPS:
```bash
# SSH into VPS
ssh username@your-vps-ip

# One-line deployment:
cd /var/www/cryptohoru && git pull && npm install && npm run build && pm2 restart cryptohoru
```

---

## Useful Commands

```bash
# View logs
pm2 logs cryptohoru

# Monitor app
pm2 monit

# Restart app
pm2 restart cryptohoru

# Check status
pm2 status

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

```bash
# App won't start?
pm2 logs cryptohoru --lines 50

# Nginx 502 error?
pm2 restart cryptohoru

# Build failed?
rm -rf .next node_modules
npm install
npm run build

# Can't pull changes?
git stash && git pull && git stash pop
```

---

## Environment Variables (.env.local on VPS)

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cryptohoru
AUTH_SECRET=your-production-secret  # Generate: openssl rand -base64 32
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Nginx Config Template

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
    }
}
```

---

## Deployment Script (Optional)

```bash
# Create: /var/www/cryptohoru/deploy.sh
#!/bin/bash
cd /var/www/cryptohoru
git pull origin main
npm install
npm run build
pm2 restart cryptohoru
echo "✅ Deployed!"
```

```bash
# Make executable:
chmod +x deploy.sh

# Run:
./deploy.sh
```

---

## Key Points

✅ **Git** - Version control (GitHub/GitLab)
✅ **PM2** - Keeps app running (auto-restart on crash)
✅ **Nginx** - Web server (handles domain & SSL)
✅ **Let's Encrypt** - Free SSL certificates
✅ **Deploy Time** - ~30 seconds per update

---

See **DEPLOYMENT_VPS.md** for full guide!
