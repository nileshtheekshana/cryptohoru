# 🛡️ AUTO-DEPLOY WEBHOOK SETUP

This guide sets up automated deployment when GitHub Actions applies security patches.

## 📋 What This Does

When the auto-security-patch workflow detects and fixes vulnerabilities:
1. GitHub Actions patches the code
2. Sends webhook to your VPS
3. VPS automatically pulls, builds, and restarts your app
4. Zero downtime security updates!

## 🚀 Setup Steps

### Step 1: Install Webhook Handler on VPS

```bash
# SSH to your VPS
ssh root@174.138.28.209

# Upload the webhook script
cd /root
nano auto-deploy-webhook.sh
# Paste the content from auto-deploy-webhook.sh

# Make it executable
chmod +x auto-deploy-webhook.sh

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "WEBHOOK_SECRET=$WEBHOOK_SECRET" >> /root/.env
echo "Your webhook secret: $WEBHOOK_SECRET"
# ⚠️ COPY THIS SECRET - you'll need it for GitHub!

# Start webhook server
export WEBHOOK_SECRET=$(grep WEBHOOK_SECRET /root/.env | cut -d= -f2)
./auto-deploy-webhook.sh

# Check if it's running
ps aux | grep webhook
```

### Step 2: Configure Firewall

```bash
# Allow webhook port
ufw allow 9000/tcp
ufw reload
```

### Step 3: Add GitHub Secrets

Go to your GitHub repo: `https://github.com/YOUR_USERNAME/cryptohoru/settings/secrets/actions`

Add these secrets:

1. **DEPLOY_WEBHOOK**
   ```
   http://174.138.28.209:9000/hooks/deploy
   ```

2. **DEPLOY_WEBHOOK_SECRET**
   ```
   [Paste the webhook secret from Step 1]
   ```

### Step 4: Make Webhook Persistent

```bash
# Create systemd service
cat > /etc/systemd/system/auto-deploy.service << 'EOF'
[Unit]
Description=Auto Deploy Webhook Handler
After=network.target

[Service]
Type=forking
User=root
WorkingDirectory=/root
EnvironmentFile=/root/.env
ExecStart=/root/auto-deploy-webhook.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable auto-deploy
systemctl start auto-deploy
systemctl status auto-deploy
```

### Step 5: Test the Webhook

```bash
# From your local machine, test the webhook manually
WEBHOOK_SECRET="your-secret-here"
PAYLOAD='{"ref":"refs/heads/main","repository":{"name":"test"}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')

curl -X POST http://174.138.28.209:9000/hooks/deploy \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"

# Check deployment log
ssh root@174.138.28.209 "tail -f /var/log/auto-deploy.log"
```

## 🔍 Verification

1. **Check webhook is running:**
   ```bash
   systemctl status auto-deploy
   ```

2. **View deployment logs:**
   ```bash
   tail -f /var/log/auto-deploy.log
   ```

3. **Test auto-patch workflow manually:**
   - Go to GitHub Actions tab
   - Select "Auto Security Patch"
   - Click "Run workflow"

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────┐
│ 1. GitHub Actions detects vulnerability                 │
│    (Daily at 2 AM UTC or manual trigger)               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Auto-patch workflow runs                            │
│    - npm audit fix                                      │
│    - Patch CVE-2025-55182 if detected                  │
│    - Commit & push changes                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Webhook triggered with HMAC signature               │
│    POST http://your-vps:9000/hooks/deploy              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. VPS validates signature and deploys                 │
│    - git pull origin main                              │
│    - npm install                                        │
│    - npm run build                                      │
│    - pm2 restart cryptohoru                            │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Security Notes

- **Webhook secret**: HMAC-SHA256 validates requests from GitHub
- **Port 9000**: Only accepts POST requests to `/hooks/deploy`
- **Signature validation**: Prevents unauthorized deployments
- **Logs**: All deployments logged to `/var/log/auto-deploy.log`

## 🐛 Troubleshooting

### Webhook not triggering
```bash
# Check if webhook server is running
systemctl status auto-deploy

# Check logs
tail -f /var/log/auto-deploy.log

# Restart webhook
systemctl restart auto-deploy
```

### Deployment failing
```bash
# Check build logs
cd /var/www/cryptohoru
pm2 logs cryptohoru

# Check nginx logs
tail -f /var/log/nginx/error.log
```

### GitHub Action failing
- Check GitHub Actions tab for error logs
- Verify DEPLOY_WEBHOOK and DEPLOY_WEBHOOK_SECRET are set
- Test webhook manually with curl command above

## 📊 Monitoring

View real-time deployments:
```bash
# Watch deployment log
tail -f /var/log/auto-deploy.log

# Watch PM2 logs
pm2 logs cryptohoru --lines 50

# Check app status
pm2 status
curl -I https://cryptohoru.online
```

## ✅ Success Indicators

After setup, you should see:
- ✅ Webhook service running (`systemctl status auto-deploy`)
- ✅ Port 9000 open (`ufw status`)
- ✅ GitHub secrets configured
- ✅ Test deployment successful
- ✅ Logs showing deployment activity

Your site is now **automatically protected** against future vulnerabilities! 🎉
