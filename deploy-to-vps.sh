#!/bin/bash

# ╔════════════════════════════════════════════════════════════════╗
# ║  CryptoHoru VPS Deployment Script (Private Repo)               ║
# ║  - First run: Full setup + hosting                             ║
# ║  - After: One-click updates                                    ║
# ╚════════════════════════════════════════════════════════════════╝

# ============ CONFIGURATION ============
DOMAIN="cryptohoru.com"
PROJECT_DIR="/var/www/cryptohoru"
PM2_APP_NAME="cryptohoru"
GIT_USERNAME="nileshtheekshana"
REPO_NAME="cryptohoru"
NODE_VERSION="20"
# GitHub token will be stored in /root/.git_token after first setup
TOKEN_FILE="/root/.git_token"
# =======================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}   ${GREEN}🚀 CryptoHoru Deployment Script${NC}                              ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run as root: sudo ./deploy-to-vps.sh"
    fi
}

# Get or set GitHub token
get_github_token() {
    if [ -f "$TOKEN_FILE" ]; then
        GIT_TOKEN=$(cat $TOKEN_FILE)
    else
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}GitHub Personal Access Token Required (Private Repo)${NC}"
        echo -e "${CYAN}Create one at: https://github.com/settings/tokens${NC}"
        echo -e "${CYAN}Required scope: repo (Full control of private repositories)${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        read -sp "Enter your GitHub Personal Access Token: " GIT_TOKEN
        echo ""
        
        # Save token securely
        echo "$GIT_TOKEN" > $TOKEN_FILE
        chmod 600 $TOKEN_FILE
        print_success "Token saved securely to $TOKEN_FILE"
    fi
}

# ============ FIRST TIME SETUP ============
first_time_setup() {
    print_header
    echo -e "${YELLOW}🔧 FIRST TIME SETUP DETECTED${NC}"
    echo ""
    
    # Get GitHub token first
    get_github_token
    
    # Update system
    print_step "Updating system packages..."
    apt update && apt upgrade -y
    print_success "System updated"
    
    # Install Node.js
    print_step "Installing Node.js ${NODE_VERSION}..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt install -y nodejs
    fi
    print_success "Node.js $(node -v) installed"
    
    # Install PM2
    print_step "Installing PM2..."
    npm install -g pm2
    print_success "PM2 installed"
    
    # Install Nginx
    print_step "Installing Nginx..."
    apt install -y nginx
    systemctl enable nginx
    print_success "Nginx installed"
    
    # Install Certbot for SSL
    print_step "Installing Certbot..."
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
    
    # Install Git
    print_step "Installing Git..."
    apt install -y git
    print_success "Git installed"
    
    # Create project directory
    print_step "Setting up project directory..."
    mkdir -p $PROJECT_DIR
    
    # Clone private repository
    print_step "Cloning private repository..."
    REPO_URL="https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/${GIT_USERNAME}/${REPO_NAME}.git"
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        cd $PROJECT_DIR
        git remote set-url origin $REPO_URL
        git pull origin main
    else
        rm -rf $PROJECT_DIR/*
        git clone $REPO_URL $PROJECT_DIR
    fi
    print_success "Repository cloned"
    
    # Configure git to store credentials
    cd $PROJECT_DIR
    git config credential.helper store
    
    # Create .env.local
    print_step "Setting up environment variables..."
    if [ ! -f "$PROJECT_DIR/.env.local" ]; then
        echo -e "${YELLOW}Creating .env.local - Please enter your values!${NC}"
        echo ""
        
        read -p "Enter MongoDB URI: " MONGODB_URI
        read -p "Enter AUTH_SECRET (or press Enter to generate): " AUTH_SECRET
        
        if [ -z "$AUTH_SECRET" ]; then
            AUTH_SECRET=$(openssl rand -base64 32)
            echo -e "${GREEN}Generated AUTH_SECRET: $AUTH_SECRET${NC}"
        fi
        
        cat > $PROJECT_DIR/.env.local << EOF
# MongoDB Connection
MONGODB_URI=$MONGODB_URI

# NextAuth Configuration
NEXTAUTH_URL=https://$DOMAIN
AUTH_SECRET=$AUTH_SECRET
AUTH_TRUST_HOST=true

# Environment
NODE_ENV=production
EOF
        print_success "Environment file created"
    fi
    
    # Install dependencies
    cd $PROJECT_DIR
    print_step "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed"
    
    # Build
    print_step "Building application..."
    NODE_OPTIONS="--max_old_space_size=1024" npm run build
    print_success "Build completed"
    
    # Setup PM2
    print_step "Setting up PM2..."
    pm2 delete $PM2_APP_NAME 2>/dev/null
    pm2 start npm --name "$PM2_APP_NAME" -- start
    pm2 save
    pm2 startup
    print_success "PM2 configured"
    
    # Setup Nginx
    print_step "Configuring Nginx..."
    cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name cryptohoru.com www.cryptohoru.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
NGINX

    # Enable site
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    nginx -t && systemctl restart nginx
    print_success "Nginx configured"
    
    # Setup SSL
    print_step "Setting up SSL certificate..."
    echo ""
    read -p "Enter your email for SSL certificate: " SSL_EMAIL
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL || {
        print_warning "SSL setup failed - run manually: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    }
    print_success "SSL configured"
    
    # Setup firewall
    print_step "Configuring firewall..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    print_success "Firewall configured"
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}   ${GREEN}✅ FIRST TIME SETUP COMPLETE!${NC}                                ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your site is now live at: https://$DOMAIN${NC}"
    echo ""
    echo -e "${CYAN}For future updates, just run:${NC}"
    echo -e "${YELLOW}  sudo ./deploy-to-vps.sh${NC}"
    echo ""
    pm2 status
}

# ============ UPDATE DEPLOYMENT ============
update_deployment() {
    print_header
    echo -e "${CYAN}🔄 UPDATING DEPLOYMENT${NC}"
    echo ""
    
    # Get GitHub token
    get_github_token
    
    cd $PROJECT_DIR || print_error "Project directory not found!"
    
    # Update remote URL with token
    REPO_URL="https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/${GIT_USERNAME}/${REPO_NAME}.git"
    git remote set-url origin $REPO_URL
    
    # Stash local changes
    print_step "Stashing local changes..."
    git stash --quiet 2>/dev/null
    
    # Pull latest
    print_step "Pulling latest code..."
    git pull origin main --force
    if [ $? -ne 0 ]; then
        print_error "Git pull failed!"
    fi
    print_success "Code updated"
    
    # Install dependencies
    print_step "Installing dependencies..."
    npm install --silent
    print_success "Dependencies installed"
    
    # Build
    print_step "Building application..."
    NODE_OPTIONS="--max_old_space_size=1024" npm run build
    if [ $? -ne 0 ]; then
        print_error "Build failed!"
    fi
    print_success "Build completed"
    
    # Restart PM2
    print_step "Restarting server..."
    pm2 restart $PM2_APP_NAME --update-env
    print_success "Server restarted"
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}   ${GREEN}✅ DEPLOYMENT COMPLETE!${NC}                                      ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    pm2 status $PM2_APP_NAME
    echo ""
    echo -e "${GREEN}🌐 Site updated at: https://$DOMAIN${NC}"
}

# ============ MAIN ============
main() {
    check_root
    
    # Check if this is first time setup or update
    if [ ! -d "$PROJECT_DIR/.git" ] || [ ! -f "$PROJECT_DIR/.env.local" ]; then
        first_time_setup
    else
        update_deployment
    fi
}

# Run
main
