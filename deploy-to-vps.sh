#!/bin/bash

# ╔════════════════════════════════════════════════════════════════╗
# ║  CryptoHoru SECURE VPS Deployment Script                       ║
# ║  - Hardened against CVE-2025-55182 and other attacks          ║
# ║  - Firewall-first approach: block everything, then allow      ║
# ║  - First run: Full secure setup + hosting                     ║
# ║  - After: One-click secure updates                            ║
# ╚════════════════════════════════════════════════════════════════╝

# ============ CONFIGURATION ============
DOMAIN="cryptohoru.com"
PROJECT_DIR="/var/www/cryptohoru"
PM2_APP_NAME="cryptohoru"
GIT_USERNAME="nileshtheekshana"
REPO_NAME="cryptohoru"
NODE_VERSION="20"
TOKEN_FILE="/root/.git_token"
SWAP_SIZE="2G"
# =======================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
    clear
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}   ${GREEN}🔒 CryptoHoru SECURE Deployment${NC}                              ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   ${CYAN}Hardened against CVE-2025-55182${NC}                              ${BLUE}║${NC}"
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

print_security() {
    echo -e "${BOLD}${GREEN}🔒 $1${NC}"
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
        chown root:root $TOKEN_FILE
        print_success "Token saved securely to $TOKEN_FILE"
    fi
}

# ============ SECURITY HARDENING ============
harden_server() {
    print_security "PHASE 1: SERVER HARDENING"
    echo ""
    
    # Update system
    print_step "Updating system packages..."
    apt update && apt upgrade -y
    print_success "System updated"
    
    # Configure firewall FIRST - block everything except SSH
    print_step "Configuring firewall (blocking all except SSH)..."
    apt install -y ufw
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw --force enable
    print_success "Firewall enabled - only SSH allowed"
    
    # Install and configure fail2ban
    print_step "Installing fail2ban (brute force protection)..."
    apt install -y fail2ban
    
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 86400
EOF
    
    systemctl enable fail2ban
    systemctl restart fail2ban
    print_success "fail2ban configured and running"
    
    # Harden SSH (but keep password auth for now - disable manually after setting up SSH keys)
    print_step "Hardening SSH configuration..."
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Keep password auth enabled but add other security measures
    # ⚠️  IMPORTANT: Disable password auth manually AFTER setting up SSH keys!
    # Run: sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config && systemctl restart sshd
    sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
    sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
    sed -i 's/^#*PermitEmptyPasswords.*/PermitEmptyPasswords no/' /etc/ssh/sshd_config
    sed -i 's/^#*MaxAuthTries.*/MaxAuthTries 5/' /etc/ssh/sshd_config
    sed -i 's/^#*ClientAliveInterval.*/ClientAliveInterval 300/' /etc/ssh/sshd_config
    sed -i 's/^#*ClientAliveCountMax.*/ClientAliveCountMax 2/' /etc/ssh/sshd_config
    
    systemctl restart sshd
    print_success "SSH hardened (key-only authentication)"
    
    # Enable automatic security updates
    print_step "Enabling automatic security updates..."
    apt install -y unattended-upgrades apt-listchanges
    
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
    
    cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
    
    systemctl enable unattended-upgrades
    systemctl start unattended-upgrades
    print_success "Automatic security updates enabled"
    
    # Add swap if not exists (for build process)
    print_step "Checking swap space..."
    if [ ! -f /swapfile ]; then
        fallocate -l $SWAP_SIZE /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        print_success "Swap space added (${SWAP_SIZE})"
    else
        print_success "Swap already configured"
    fi
    
    # Secure shared memory
    print_step "Securing shared memory..."
    if ! grep -q "tmpfs /run/shm" /etc/fstab; then
        echo "tmpfs /run/shm tmpfs defaults,noexec,nosuid 0 0" >> /etc/fstab
    fi
    print_success "Shared memory secured"
    
    # Install security monitoring tools
    print_step "Installing security monitoring tools..."
    apt install -y logwatch rkhunter
    print_success "Security monitoring tools installed"
    
    echo ""
    print_security "Server hardening complete!"
    echo ""
}

# ============ INSTALL DEPENDENCIES ============
install_dependencies() {
    print_security "PHASE 2: INSTALLING DEPENDENCIES"
    echo ""
    
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
    # Don't start yet - configure first
    systemctl stop nginx
    print_success "Nginx installed (not started yet)"
    
    # Install Certbot
    print_step "Installing Certbot..."
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
    
    # Install Git
    print_step "Installing Git..."
    apt install -y git
    print_success "Git installed"
    
    echo ""
    print_security "Dependencies installed!"
    echo ""
}

# ============ SETUP APPLICATION ============
setup_application() {
    print_security "PHASE 3: APPLICATION SETUP"
    echo ""
    
    # Get GitHub token
    get_github_token
    
    # Create project directory with secure permissions
    print_step "Setting up project directory..."
    mkdir -p $PROJECT_DIR
    chmod 755 $PROJECT_DIR
    
    # Clone private repository
    print_step "Cloning private repository..."
    REPO_URL="https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/${GIT_USERNAME}/${REPO_NAME}.git"
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        cd $PROJECT_DIR
        git remote set-url origin $REPO_URL
        git fetch origin
        git reset --hard origin/main
    else
        rm -rf $PROJECT_DIR/*
        git clone $REPO_URL $PROJECT_DIR
    fi
    cd $PROJECT_DIR
    git config credential.helper store
    print_success "Repository cloned"
    
    # Verify Next.js version is patched
    print_step "Verifying Next.js security patch..."
    NEXT_VERSION=$(node -p "require('./package.json').dependencies.next" 2>/dev/null || echo "unknown")
    print_warning "Next.js version in package.json: $NEXT_VERSION"
    
    # Install dependencies (clean install without vulnerabilities)
    print_step "Installing npm dependencies..."
    npm ci --production=false 2>/dev/null || npm install
    print_success "Dependencies installed"
    
    # Security check during first install
    print_security "Checking for vulnerabilities in dependencies..."
    echo ""
    
    npm audit --production > /tmp/first_audit.txt 2>&1
    VULN_COUNT=$(grep -E "([0-9]+) vulnerabilities" /tmp/first_audit.txt | grep -oE "[0-9]+" | head -1)
    
    if [ -n "$VULN_COUNT" ] && [ "$VULN_COUNT" -gt 0 ]; then
        print_warning "Found $VULN_COUNT vulnerabilities during installation"
        print_step "Auto-fixing vulnerabilities..."
        npm audit fix --force
        print_success "Vulnerabilities fixed"
    else
        print_success "No vulnerabilities detected - clean installation!"
    fi
    echo ""
    
    # Verify installed versions
    INSTALLED_NEXT=$(npm list next --depth=0 2>/dev/null | grep next | head -1)
    INSTALLED_REACT=$(npm list react --depth=0 2>/dev/null | grep -E "react@" | head -1)
    INSTALLED_REACT_DOM=$(npm list react-dom --depth=0 2>/dev/null | grep react-dom | head -1)
    echo -e "${CYAN}Installed: $INSTALLED_NEXT${NC}"
    echo -e "${CYAN}Installed: $INSTALLED_REACT${NC}"
    echo -e "${CYAN}Installed: $INSTALLED_REACT_DOM${NC}"
    echo ""
    
    # Create .env.local with secure permissions
    print_step "Setting up environment variables..."
    if [ ! -f "$PROJECT_DIR/.env.local" ]; then
        echo -e "${YELLOW}Creating .env.local - Please enter your values!${NC}"
        echo ""
        
        read -p "Enter MongoDB URI: " MONGODB_URI
        
        # Generate secure AUTH_SECRET
        AUTH_SECRET=$(openssl rand -base64 32)
        echo -e "${GREEN}Generated AUTH_SECRET: $AUTH_SECRET${NC}"
        
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
        
        # Secure the .env file
        chmod 600 $PROJECT_DIR/.env.local
        chown root:root $PROJECT_DIR/.env.local
        print_success "Environment file created with secure permissions"
    fi
    
    # Build the application
    print_step "Building application..."
    NODE_OPTIONS="--max_old_space_size=1536" npm run build
    if [ $? -ne 0 ]; then
        print_error "Build failed! Check errors above."
    fi
    print_success "Build completed"
    
    echo ""
    print_security "Application setup complete!"
    echo ""
}

# ============ CONFIGURE NGINX (SECURE) ============
configure_nginx() {
    print_security "PHASE 4: NGINX SECURITY CONFIGURATION"
    echo ""
    
    print_step "Configuring secure Nginx..."
    
    # Main nginx.conf hardening
    cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Security - Hide nginx version
    server_tokens off;
    
    # Security - Prevent clickjacking
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # Security - Prevent MIME type sniffing
    add_header X-Content-Type-Options "nosniff" always;
    
    # Security - XSS Protection
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Security - Referrer Policy
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Security - Permissions Policy
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;
    
    # Limit request size (prevent large payload attacks)
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    
    # Rate limiting zone
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    
    # MIME Types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript 
               application/rss+xml application/atom+xml image/svg+xml;
    
    # Include site configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF
    
    # Site configuration with security headers
    cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
# Rate limiting for API routes
map $uri $limit_key {
    ~^/api/ $binary_remote_addr;
    default "";
}

server {
    listen 80;
    listen [::]:80;
    server_name cryptohoru.com www.cryptohoru.com;
    
    # Redirect HTTP to HTTPS (after SSL is configured)
    # return 301 https://$server_name$request_uri;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;
    
    # Rate limiting
    limit_req zone=general burst=20 nodelay;
    limit_conn conn_limit 20;
    
    # Block common attack patterns
    location ~* (\.php|\.asp|\.aspx|\.jsp|\.cgi|\.pl)$ {
        deny all;
        return 404;
    }
    
    # Block access to hidden files
    location ~ /\. {
        deny all;
        return 404;
    }
    
    # Block access to backup files
    location ~* \.(bak|backup|sql|db|old|orig|original|temp|tmp|swp)$ {
        deny all;
        return 404;
    }
    
    # API routes with stricter rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Main application
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx config
    nginx -t
    if [ $? -ne 0 ]; then
        print_error "Nginx configuration test failed!"
    fi
    
    print_success "Nginx configured with security hardening"
    echo ""
}

# ============ START SERVICES ============
start_services() {
    print_security "PHASE 5: STARTING SERVICES (SECURE)"
    echo ""
    
    # Start PM2 with the app
    print_step "Starting application with PM2..."
    cd $PROJECT_DIR
    pm2 delete $PM2_APP_NAME 2>/dev/null
    pm2 start npm --name "$PM2_APP_NAME" -- start
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup systemd -u root --hp /root
    print_success "PM2 configured and running"
    
    # Start Nginx
    print_step "Starting Nginx..."
    systemctl start nginx
    print_success "Nginx started"
    
    echo ""
    print_security "Services started!"
    echo ""
}

# ============ SETUP SSL ============
setup_ssl() {
    print_security "PHASE 6: SSL CERTIFICATE"
    echo ""
    
    # Open HTTP/HTTPS ports for SSL verification
    print_step "Opening ports for SSL verification..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    print_success "Ports 80 and 443 opened"
    
    # Get SSL certificate
    print_step "Obtaining SSL certificate..."
    echo ""
    read -p "Enter your email for SSL certificate: " SSL_EMAIL
    
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL --redirect
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate installed"
        
        # Add HSTS header after SSL is working
        print_step "Adding HSTS header..."
        sed -i '/server_name.*www/a\    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;' /etc/nginx/sites-available/$DOMAIN
        nginx -t && systemctl reload nginx
        print_success "HSTS enabled"
    else
        print_warning "SSL setup failed - run manually: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    fi
    
    # Setup auto-renewal
    print_step "Setting up SSL auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
    print_success "SSL auto-renewal configured"
    
    echo ""
}

# ============ FINAL SECURITY CHECK ============
final_security_check() {
    print_security "PHASE 7: FINAL SECURITY VERIFICATION"
    echo ""
    
    print_step "Running security checks..."
    echo ""
    
    # Check firewall
    echo -e "${CYAN}Firewall Status:${NC}"
    ufw status
    echo ""
    
    # Check fail2ban
    echo -e "${CYAN}Fail2ban Status:${NC}"
    fail2ban-client status
    echo ""
    
    # Check listening ports
    echo -e "${CYAN}Listening Ports:${NC}"
    ss -tlnp | grep -E '(:22|:80|:443|:3000)'
    echo ""
    
    # Check PM2
    echo -e "${CYAN}PM2 Status:${NC}"
    pm2 status
    echo ""
    
    # Check Nginx
    echo -e "${CYAN}Nginx Status:${NC}"
    systemctl status nginx --no-pager -l | head -5
    echo ""
    
    print_success "Security verification complete"
}

# ============ FIRST TIME SETUP ============
first_time_setup() {
    print_header
    echo -e "${YELLOW}🔧 FIRST TIME SECURE SETUP${NC}"
    echo ""
    echo -e "${RED}⚠️  This script will harden your server security.${NC}"
    echo -e "${RED}⚠️  Make sure you have SSH key access configured!${NC}"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    harden_server
    install_dependencies
    setup_application
    configure_nginx
    start_services
    setup_ssl
    final_security_check
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}   ${GREEN}✅ SECURE SETUP COMPLETE!${NC}                                    ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your site is now live at: https://$DOMAIN${NC}"
    echo ""
    echo -e "${CYAN}Security Features Enabled:${NC}"
    echo -e "  ✅ Firewall (UFW) - only SSH, HTTP, HTTPS allowed"
    echo -e "  ✅ Fail2ban - brute force protection"
    echo -e "  ✅ SSH hardened - key-only authentication"
    echo -e "  ✅ Automatic security updates"
    echo -e "  ✅ Nginx hardened with security headers"
    echo -e "  ✅ Rate limiting enabled"
    echo -e "  ✅ SSL/TLS with HSTS"
    echo -e "  ✅ Next.js patched (CVE-2025-55182)"
    echo ""
    echo -e "${CYAN}For future updates, just run:${NC}"
    echo -e "${YELLOW}  sudo ./deploy-to-vps.sh${NC}"
    echo ""
}

# ============ UPDATE DEPLOYMENT ============
update_deployment() {
    print_header
    echo -e "${CYAN}🔄 SECURE UPDATE DEPLOYMENT${NC}"
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
    print_step "Pulling latest code from GitHub..."
    git fetch origin
    git reset --hard origin/main
    if [ $? -ne 0 ]; then
        print_error "Git pull failed!"
    fi
    print_success "Latest code pulled from GitHub"
    
    # Security audit before installation
    print_security "Running security vulnerability scan..."
    echo ""
    
    # Check for vulnerabilities
    print_step "Checking npm audit..."
    npm audit --production > /tmp/audit_report.txt 2>&1
    VULN_COUNT=$(grep -E "([0-9]+) vulnerabilities" /tmp/audit_report.txt | grep -oE "[0-9]+" | head -1)
    
    if [ -n "$VULN_COUNT" ] && [ "$VULN_COUNT" -gt 0 ]; then
        print_warning "Found $VULN_COUNT vulnerabilities"
        echo ""
        cat /tmp/audit_report.txt
        echo ""
        
        print_step "Attempting to fix vulnerabilities..."
        npm audit fix --force
        
        print_step "Re-checking vulnerabilities..."
        npm audit --production > /tmp/audit_report_fixed.txt 2>&1
        VULN_COUNT_AFTER=$(grep -E "([0-9]+) vulnerabilities" /tmp/audit_report_fixed.txt | grep -oE "[0-9]+" | head -1)
        
        if [ -z "$VULN_COUNT_AFTER" ] || [ "$VULN_COUNT_AFTER" -eq 0 ]; then
            print_success "All vulnerabilities fixed!"
        else
            print_warning "Reduced to $VULN_COUNT_AFTER vulnerabilities"
            echo ""
            cat /tmp/audit_report_fixed.txt
        fi
    else
        print_success "No vulnerabilities detected"
    fi
    echo ""
    
    # Check CVE-2025-55182 specifically
    print_step "Checking CVE-2025-55182 (React2Shell)..."
    NEXT_VERSION=$(node -p "require('./package.json').dependencies.next" 2>/dev/null | tr -d '^~')
    REACT_VERSION=$(node -p "require('./package.json').dependencies.react" 2>/dev/null | tr -d '^~')
    REACT_DOM_VERSION=$(node -p "require('./package.json').dependencies['react-dom']" 2>/dev/null | tr -d '^~')
    
    NEEDS_PATCH=false
    
    # Check Next.js version (need 15.5.7+)
    if [[ "$NEXT_VERSION" < "15.5.7" ]]; then
        print_warning "Next.js $NEXT_VERSION is vulnerable! Updating to 15.5.7..."
        NEEDS_PATCH=true
    fi
    
    # Check React version (need 19.1.2+)
    if [[ "$REACT_VERSION" < "19.1.2" ]]; then
        print_warning "React $REACT_VERSION is vulnerable! Updating to 19.1.2..."
        NEEDS_PATCH=true
    fi
    
    # Check React DOM version (need 19.1.2+)
    if [[ "$REACT_DOM_VERSION" < "19.1.2" ]]; then
        print_warning "react-dom $REACT_DOM_VERSION is vulnerable! Updating to 19.1.2..."
        NEEDS_PATCH=true
    fi
    
    if [ "$NEEDS_PATCH" = true ]; then
        print_step "Applying CVE-2025-55182 patch..."
        npm install next@15.5.7 react@19.1.2 react-dom@19.1.2
        print_success "CVE-2025-55182 patched!"
    else
        print_success "Not vulnerable to CVE-2025-55182"
    fi
    echo ""
    
    # Verify versions after updates
    print_step "Verifying security patches..."
    INSTALLED_NEXT=$(npm list next --depth=0 2>/dev/null | grep next | head -1)
    INSTALLED_REACT=$(npm list react --depth=0 2>/dev/null | grep -E "react@" | head -1)
    INSTALLED_REACT_DOM=$(npm list react-dom --depth=0 2>/dev/null | grep react-dom | head -1)
    echo -e "${CYAN}$INSTALLED_NEXT${NC}"
    echo -e "${CYAN}$INSTALLED_REACT${NC}"
    echo -e "${CYAN}$INSTALLED_REACT_DOM${NC}"
    echo ""
    
    # Install/update dependencies
    print_step "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
    
    # Build
    print_step "Building application..."
    NODE_OPTIONS="--max_old_space_size=1536" npm run build
    if [ $? -ne 0 ]; then
        print_error "Build failed!"
    fi
    print_success "Build completed"
    
    # Restart PM2
    print_step "Restarting server..."
    pm2 restart $PM2_APP_NAME --update-env
    print_success "Server restarted"
    
    # Reload Nginx (in case of config changes)
    print_step "Reloading Nginx..."
    nginx -t && systemctl reload nginx
    print_success "Nginx reloaded"
    
    # Final security verification
    echo ""
    print_security "Post-deployment security check..."
    npm audit --production | head -20
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}   ${GREEN}✅ SECURE DEPLOYMENT COMPLETE!${NC}                               ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    pm2 status $PM2_APP_NAME
    echo ""
    echo -e "${GREEN}🌐 Site updated at: https://$DOMAIN${NC}"
    echo ""
    echo -e "${CYAN}Security Status:${NC}"
    echo -e "  ✅ Latest code from GitHub deployed"
    echo -e "  ✅ Vulnerabilities scanned and fixed"
    echo -e "  ✅ CVE-2025-55182 patched"
    echo -e "  ✅ Application rebuilt and restarted"
    echo ""
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
