#!/bin/bash

# ============================================================
#  AUTO-DEPLOY WEBHOOK HANDLER
#  Listens for GitHub webhooks and auto-deploys patches
# ============================================================

WEBHOOK_PORT=9000
WEBHOOK_SECRET="${WEBHOOK_SECRET:-changeme}"
PROJECT_DIR="/var/www/cryptohoru"
LOG_FILE="/var/log/auto-deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

deploy() {
    log "Starting auto-deployment..."
    
    cd "$PROJECT_DIR" || exit 1
    
    # Pull latest changes
    log "Pulling from GitHub..."
    git pull origin main >> "$LOG_FILE" 2>&1
    
    # Install dependencies
    log "Installing dependencies..."
    npm install >> "$LOG_FILE" 2>&1
    
    # Build
    log "Building application..."
    NODE_OPTIONS="--max_old_space_size=1024" npm run build >> "$LOG_FILE" 2>&1
    
    # Restart PM2
    log "Restarting application..."
    pm2 restart cryptohoru >> "$LOG_FILE" 2>&1
    
    log "Deployment complete!"
}

# Install webhook handler
if ! command -v webhook &> /dev/null; then
    log "Installing webhook handler..."
    wget https://github.com/adnanh/webhook/releases/download/2.8.0/webhook-linux-amd64.tar.gz
    tar -xzf webhook-linux-amd64.tar.gz
    mv webhook-linux-amd64/webhook /usr/local/bin/
    rm -rf webhook-linux-amd64*
fi

# Create webhook config
cat > /etc/webhook.conf << EOF
[
  {
    "id": "deploy",
    "execute-command": "$0",
    "command-working-directory": "$PROJECT_DIR",
    "pass-arguments-to-command": [],
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha256",
        "secret": "$WEBHOOK_SECRET",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
EOF

# If called by webhook, deploy
if [ "$1" == "deploy" ]; then
    deploy
    exit 0
fi

# Start webhook server
log "Starting webhook server on port $WEBHOOK_PORT..."
nohup webhook -hooks /etc/webhook.conf -port $WEBHOOK_PORT >> "$LOG_FILE" 2>&1 &

log "Webhook server started! Listening on port $WEBHOOK_PORT"
