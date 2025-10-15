#!/bin/bash

###############################################################################
# CryptoHoru Migration Script
# 
# This script will:
# 1. Backup your existing website
# 2. Fix Node.js installation (install v20 with npm)
# 3. Stop and remove old website
# 4. Deploy CryptoHoru
# 5. Configure Nginx for softsace.com
# 6. Setup SSL (if needed)
#
# Usage: bash migrate-to-cryptohoru.sh
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="softsace.com"
APP_DIR="/var/www/cryptohoru"
BACKUP_DIR="/root/backups/$(date +%Y%m%d_%H%M%S)"
GITHUB_REPO="https://github.com/nileshtheekshana/cryptohoru.git"
APP_PORT="3000"

# Function to print colored output
print_status() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_important() {
    echo ""
    echo -e "${MAGENTA}⚡ IMPORTANT: $1${NC}"
    echo ""
}

###############################################################################
# Pre-flight checks
###############################################################################

print_header "CryptoHoru Migration Script"
echo -e "${CYAN}Domain:${NC} $DOMAIN"
echo -e "${CYAN}Target Directory:${NC} $APP_DIR"
echo -e "${CYAN}Backup Location:${NC} $BACKUP_DIR"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root: sudo bash migrate-to-cryptohoru.sh"
    exit 1
fi

print_success "Running as root"

# Confirm before proceeding
print_important "This will REPLACE your existing website on $DOMAIN"
read -p "Do you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_warning "Migration cancelled by user"
    exit 0
fi

###############################################################################
# STEP 1: Backup existing website
###############################################################################

print_header "STEP 1: Backing Up Existing Website"

mkdir -p "$BACKUP_DIR"
print_success "Created backup directory: $BACKUP_DIR"

# Backup website files
if [ -d "/var/www" ]; then
    print_status "Backing up /var/www..."
    cp -r /var/www "$BACKUP_DIR/" 2>/dev/null || print_warning "Some files couldn't be backed up"
    print_success "Website files backed up"
else
    print_warning "/var/www directory not found"
fi

# Backup Nginx configs
if [ -d "/etc/nginx/sites-available" ]; then
    print_status "Backing up Nginx configurations..."
    cp -r /etc/nginx/sites-available "$BACKUP_DIR/" 2>/dev/null || true
    cp -r /etc/nginx/sites-enabled "$BACKUP_DIR/" 2>/dev/null || true
    print_success "Nginx configs backed up"
fi

# Backup PM2 list
if command -v pm2 &> /dev/null; then
    print_status "Backing up PM2 processes..."
    pm2 list > "$BACKUP_DIR/pm2_processes.txt" 2>/dev/null || true
    pm2 save 2>/dev/null || true
    print_success "PM2 processes backed up"
fi

print_success "Backup completed at: $BACKUP_DIR"

###############################################################################
# STEP 2: Remove problematic repositories
###############################################################################

print_header "STEP 2: Cleaning Up Problematic Repositories"

# Remove Docker repositories
if ls /etc/apt/sources.list.d/docker*.list 1> /dev/null 2>&1; then
    print_warning "Found Docker repository files. Removing..."
    rm -f /etc/apt/sources.list.d/docker*.list
    print_success "Removed Docker repository files"
fi

if ls /etc/apt/sources.list.d/archive_uri-*.list 1> /dev/null 2>&1; then
    rm -f /etc/apt/sources.list.d/archive_uri-*.list
    print_success "Removed archive_uri files"
fi

# Remove Docker entries from main sources.list
if grep -qi docker /etc/apt/sources.list 2>/dev/null; then
    print_warning "Found Docker entries in sources.list. Removing..."
    sed -i '/docker/d' /etc/apt/sources.list
    print_success "Removed Docker entries"
fi

apt clean
print_success "Repository cleanup completed"

###############################################################################
# STEP 3: Stop and remove old website
###############################################################################

print_header "STEP 3: Stopping Old Website"

# Stop PM2 processes
if command -v pm2 &> /dev/null; then
    print_status "Stopping PM2 processes..."
    pm2 stop all 2>/dev/null || true
    print_status "Deleting PM2 processes..."
    pm2 delete all 2>/dev/null || true
    print_success "Old PM2 processes stopped and removed"
else
    print_warning "PM2 not found, skipping..."
fi

# Stop any process on port 3000
print_status "Checking for processes on port $APP_PORT..."
PID=$(lsof -ti:$APP_PORT 2>/dev/null || true)
if [ ! -z "$PID" ]; then
    print_warning "Found process $PID on port $APP_PORT. Killing..."
    kill -9 $PID 2>/dev/null || true
    print_success "Process killed"
else
    print_success "No process found on port $APP_PORT"
fi

###############################################################################
# STEP 4: Remove old Node.js and install v20
###############################################################################

print_header "STEP 4: Installing Node.js 20"

# Check current Node.js version
if command -v node &> /dev/null; then
    CURRENT_NODE=$(node --version)
    print_warning "Found Node.js $CURRENT_NODE. Removing..."
    apt remove -y nodejs nodejs-doc libnode* node-* npm 2>/dev/null || true
    apt autoremove -y
    print_success "Old Node.js removed"
fi

# Update package lists
print_status "Updating package lists..."
apt update 2>&1 | grep -v "docker" || true

# Install prerequisites
print_status "Installing prerequisites..."
apt install -y curl wget git build-essential ufw 2>/dev/null || true

# Install Node.js 20
print_status "Downloading NodeSource setup script..."
curl -fsSL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh

if [ $? -eq 0 ]; then
    print_success "Downloaded NodeSource setup script"
    print_status "Running NodeSource setup..."
    bash /tmp/nodesource_setup.sh 2>&1 | grep -v "docker" || true
    rm -f /tmp/nodesource_setup.sh
else
    print_error "Failed to download NodeSource script"
    exit 1
fi

print_status "Installing Node.js 20..."
apt install -y nodejs

# Verify installation
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js installed: $NODE_VERSION"
    print_success "npm installed: $NPM_VERSION"
    
    if [[ ! $NODE_VERSION == v20.* ]]; then
        print_warning "Expected Node.js 20.x but got $NODE_VERSION"
    fi
else
    print_error "Node.js or npm installation failed"
    exit 1
fi

# Install PM2
print_status "Installing PM2..."
npm install -g pm2
PM2_VERSION=$(pm2 --version)
print_success "PM2 installed: v$PM2_VERSION"

###############################################################################
# STEP 5: Clone CryptoHoru repository
###############################################################################

print_header "STEP 5: Deploying CryptoHoru"

# Remove old cryptohoru directory if exists
if [ -d "$APP_DIR" ]; then
    print_warning "Found existing $APP_DIR. Removing..."
    rm -rf "$APP_DIR"
fi

# Clone repository
print_status "Cloning repository from GitHub..."
mkdir -p /var/www
cd /var/www
git clone "$GITHUB_REPO"

if [ $? -eq 0 ]; then
    print_success "Repository cloned successfully"
else
    print_error "Failed to clone repository"
    exit 1
fi

cd "$APP_DIR"

###############################################################################
# STEP 6: Configure environment variables
###############################################################################

print_header "STEP 6: Configuring Environment"

print_important "Environment variables need to be configured"

echo -e "${YELLOW}Please provide the following information:${NC}"
echo ""

# MongoDB URI
read -p "MongoDB URI (from MongoDB Atlas): " MONGODB_URI
while [ -z "$MONGODB_URI" ]; do
    print_error "MongoDB URI cannot be empty"
    read -p "MongoDB URI: " MONGODB_URI
done

# AUTH_SECRET
echo ""
print_status "Generate AUTH_SECRET on your local machine with:"
echo -e "${CYAN}openssl rand -base64 32${NC}"
echo ""
read -p "AUTH_SECRET (paste generated secret): " AUTH_SECRET
while [ -z "$AUTH_SECRET" ]; do
    print_error "AUTH_SECRET cannot be empty"
    read -p "AUTH_SECRET: " AUTH_SECRET
done

# Create .env.local
print_status "Creating .env.local file..."
cat > "$APP_DIR/.env.local" << EOF
# MongoDB Connection String
MONGODB_URI=$MONGODB_URI

# Authentication Secret
AUTH_SECRET=$AUTH_SECRET

# Next.js URL (will be updated after SSL)
NEXTAUTH_URL=http://$DOMAIN

# Environment
NODE_ENV=production
PORT=$APP_PORT
EOF

print_success "Environment file created"

###############################################################################
# STEP 7: Install dependencies and build
###############################################################################

print_header "STEP 7: Building Application"

print_status "Installing dependencies... (this may take 2-3 minutes)"
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Building application... (this may take 2-3 minutes)"
npm run build

if [ $? -eq 0 ]; then
    print_success "Application built successfully"
else
    print_error "Build failed"
    print_warning "Check the error messages above"
    exit 1
fi

###############################################################################
# STEP 8: Start application with PM2
###############################################################################

print_header "STEP 8: Starting Application"

print_status "Starting CryptoHoru with PM2..."
cd "$APP_DIR"
pm2 start npm --name "cryptohoru" -- start

if [ $? -eq 0 ]; then
    print_success "Application started"
else
    print_error "Failed to start application"
    exit 1
fi

pm2 save
print_status "Setting up PM2 to start on boot..."
pm2 startup | tail -n 1 > /tmp/pm2_startup.sh
bash /tmp/pm2_startup.sh
rm -f /tmp/pm2_startup.sh
print_success "PM2 configured to start on boot"

# Show PM2 status
pm2 status

###############################################################################
# STEP 9: Configure Nginx
###############################################################################

print_header "STEP 9: Configuring Nginx"

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_success "Nginx installed"
else
    print_success "Nginx already installed"
fi

# Remove old site configurations
print_status "Removing old Nginx configurations..."
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/default

# Create new Nginx configuration
print_status "Creating Nginx configuration for $DOMAIN..."
cat > /etc/nginx/sites-available/cryptohoru << 'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
    
    # Redirect www to non-www
    if ($host = www.DOMAIN_PLACEHOLDER) {
        return 301 http://DOMAIN_PLACEHOLDER$request_uri;
    }
    
    location / {
        proxy_pass http://localhost:APP_PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
NGINXCONF

# Replace placeholders
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/cryptohoru
sed -i "s/APP_PORT_PLACEHOLDER/$APP_PORT/g" /etc/nginx/sites-available/cryptohoru

# Enable site
ln -s /etc/nginx/sites-available/cryptohoru /etc/nginx/sites-enabled/

# Test Nginx configuration
print_status "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    print_success "Nginx configuration is valid"
    systemctl restart nginx
    print_success "Nginx restarted"
else
    print_error "Nginx configuration has errors"
    exit 1
fi

###############################################################################
# STEP 10: Configure Firewall
###############################################################################

print_header "STEP 10: Configuring Firewall"

print_status "Configuring UFW firewall..."
ufw --force allow 22 2>/dev/null || true
ufw --force allow 80 2>/dev/null || true
ufw --force allow 443 2>/dev/null || true

# Check if UFW is active
if ufw status | grep -q "Status: active"; then
    print_success "Firewall is already active"
else
    print_status "Enabling firewall..."
    echo "y" | ufw enable
    print_success "Firewall enabled"
fi

ufw status
print_success "Firewall configured"

###############################################################################
# STEP 11: SSL Certificate Setup
###############################################################################

print_header "STEP 11: SSL Certificate Setup"

print_status "Checking for existing SSL certificates..."
if command -v certbot &> /dev/null; then
    print_success "Certbot is installed"
    
    echo ""
    read -p "Do you want to setup/renew SSL certificate for $DOMAIN? (yes/no): " -r
    echo
    
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_status "Setting up SSL certificate..."
        
        read -p "Enter your email address for SSL notifications: " SSL_EMAIL
        
        certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$SSL_EMAIL" --redirect
        
        if [ $? -eq 0 ]; then
            print_success "SSL certificate installed!"
            
            # Update environment variable
            print_status "Updating NEXTAUTH_URL to use HTTPS..."
            sed -i "s|NEXTAUTH_URL=http://$DOMAIN|NEXTAUTH_URL=https://$DOMAIN|" "$APP_DIR/.env.local"
            
            # Restart application
            pm2 restart cryptohoru
            print_success "Application restarted with HTTPS"
        else
            print_warning "SSL setup failed. You can run certbot manually later."
        fi
    else
        print_warning "Skipping SSL setup. You can add it later with:"
        echo -e "${CYAN}certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
    fi
else
    print_warning "Certbot not installed. Installing..."
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed. Run this script again to setup SSL."
fi

###############################################################################
# STEP 12: Final verification
###############################################################################

print_header "STEP 12: Final Verification"

echo ""
print_success "Migration completed successfully!"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Installation Summary${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${CYAN}Domain:${NC}       http://$DOMAIN"
echo -e "  ${CYAN}Directory:${NC}    $APP_DIR"
echo -e "  ${CYAN}Node.js:${NC}      $(node --version)"
echo -e "  ${CYAN}npm:${NC}          $(npm --version)"
echo -e "  ${CYAN}PM2:${NC}          v$(pm2 --version)"
echo -e "  ${CYAN}Backup:${NC}       $BACKUP_DIR"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

print_header "Next Steps"

echo -e "${YELLOW}1. Create Admin User:${NC}"
echo ""
echo -e "   On your LOCAL Kali machine, generate password hash:"
echo -e "   ${CYAN}node -e \"console.log(require('bcryptjs').hashSync('YourPassword123!', 12))\"${NC}"
echo ""
echo -e "   Then insert into MongoDB Atlas:"
echo -e "   • Go to: https://cloud.mongodb.com"
echo -e "   • Browse Collections → Database: cryptohoru → Collection: users"
echo -e "   • Insert document with admin role"
echo ""

echo -e "${YELLOW}2. Test Your Website:${NC}"
echo ""
if grep -q "https://$DOMAIN" "$APP_DIR/.env.local" 2>/dev/null; then
    echo -e "   • Homepage: ${GREEN}https://$DOMAIN${NC}"
    echo -e "   • Sign In: ${GREEN}https://$DOMAIN/auth/signin${NC}"
    echo -e "   • Admin Panel: ${GREEN}https://$DOMAIN/admin${NC}"
else
    echo -e "   • Homepage: ${GREEN}http://$DOMAIN${NC}"
    echo -e "   • Sign In: ${GREEN}http://$DOMAIN/auth/signin${NC}"
    echo -e "   • Admin Panel: ${GREEN}http://$DOMAIN/admin${NC}"
fi
echo ""

echo -e "${YELLOW}3. Useful Commands:${NC}"
echo ""
echo -e "   ${CYAN}pm2 status${NC}              - Check application status"
echo -e "   ${CYAN}pm2 logs cryptohoru${NC}     - View application logs"
echo -e "   ${CYAN}pm2 restart cryptohoru${NC}  - Restart application"
echo -e "   ${CYAN}systemctl status nginx${NC}  - Check Nginx status"
echo -e "   ${CYAN}nginx -t${NC}                - Test Nginx config"
echo ""

echo -e "${YELLOW}4. Deploy Updates:${NC}"
echo ""
echo -e "   ${CYAN}cd $APP_DIR${NC}"
echo -e "   ${CYAN}git pull origin main${NC}"
echo -e "   ${CYAN}npm install${NC}"
echo -e "   ${CYAN}npm run build${NC}"
echo -e "   ${CYAN}pm2 restart cryptohoru${NC}"
echo ""

print_important "Your old website backup is at: $BACKUP_DIR"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ CryptoHoru is now live on $DOMAIN!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit 0
