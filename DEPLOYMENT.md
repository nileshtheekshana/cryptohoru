# Deployment Guide for VPS

## Prerequisites on VPS

1. **Install Node.js and npm**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

2. **Install PM2 (Process Manager)**:
```bash
sudo npm install -g pm2
```

3. **Install Nginx** (optional, for reverse proxy):
```bash
sudo apt install -y nginx
```

## Deployment Steps

### Option 1: Deploy from Local to VPS

1. **Build locally**:
```bash
npm run build
```

2. **Transfer files to VPS**:
```bash
# Using rsync
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /home/nilesh/Desktop/cryptohoruweb/ \
  user@your-vps-ip:/var/www/cryptohoruweb/

# Or using scp
scp -r /home/nilesh/Desktop/cryptohoruweb user@your-vps-ip:/var/www/
```

3. **On VPS, install dependencies**:
```bash
cd /var/www/cryptohoruweb
npm install --production
```

4. **Start with PM2**:
```bash
pm2 start npm --name "cryptohoruweb" -- start
pm2 save
pm2 startup  # Follow the instructions to set up auto-start
```

### Option 2: Deploy using Git

1. **Initialize Git repo locally**:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Push to GitHub/GitLab** (create a repo first):
```bash
git remote add origin https://github.com/yourusername/cryptohoruweb.git
git push -u origin main
```

3. **On VPS, clone and deploy**:
```bash
cd /var/www
git clone https://github.com/yourusername/cryptohoruweb.git
cd cryptohoruweb
npm install
npm run build
pm2 start npm --name "cryptohoruweb" -- start
pm2 save
```

## Configure Nginx as Reverse Proxy

1. **Create Nginx configuration**:
```bash
sudo nano /etc/nginx/sites-available/cryptohoruweb
```

2. **Add configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable site**:
```bash
sudo ln -s /etc/nginx/sites-available/cryptohoruweb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically, test it:
sudo certbot renew --dry-run
```

## Environment Variables

Create a `.env.local` file for production secrets:

```bash
# On VPS
cd /var/www/cryptohoruweb
nano .env.local
```

Add your environment variables:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# Add other secrets here
```

## Useful PM2 Commands

```bash
# View logs
pm2 logs cryptohoruweb

# Restart application
pm2 restart cryptohoruweb

# Stop application
pm2 stop cryptohoruweb

# View status
pm2 status

# Monitor
pm2 monit

# Delete from PM2
pm2 delete cryptohoruweb
```

## Update/Redeploy Application

**Using Git**:
```bash
cd /var/www/cryptohoruweb
git pull origin main
npm install
npm run build
pm2 restart cryptohoruweb
```

**Manual upload**:
```bash
# Local machine
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /home/nilesh/Desktop/cryptohoruweb/ \
  user@your-vps-ip:/var/www/cryptohoruweb/

# On VPS
cd /var/www/cryptohoruweb
npm install
npm run build
pm2 restart cryptohoruweb
```

## Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

## Monitoring

Monitor your application:
```bash
# CPU and Memory usage
pm2 monit

# Logs in real-time
pm2 logs cryptohoruweb --lines 100

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

1. **Application won't start**:
   - Check logs: `pm2 logs cryptohoruweb`
   - Check Node version: `node --version`
   - Rebuild: `npm run build`

2. **502 Bad Gateway**:
   - Check if app is running: `pm2 status`
   - Check Nginx config: `sudo nginx -t`
   - Check port 3000: `netstat -tulpn | grep 3000`

3. **Permission issues**:
   - Fix ownership: `sudo chown -R $USER:$USER /var/www/cryptohoruweb`
   - Fix permissions: `chmod -R 755 /var/www/cryptohoruweb`

## Performance Optimization

1. **Enable compression in Nginx**:
Add to nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

2. **Cache static files**:
```nginx
location /_next/static {
    alias /var/www/cryptohoruweb/.next/static;
    expires 365d;
    access_log off;
}
```

3. **Increase PM2 instances** (for production):
```bash
pm2 start npm --name "cryptohoruweb" -i max -- start
```

---

**Note**: Replace `your-domain.com`, `user@your-vps-ip`, and other placeholders with your actual values.
