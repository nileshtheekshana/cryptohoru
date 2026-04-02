#!/bin/bash

###############################################################################
# VPS Node.js 20 Installation Fix Script
# For Debian-based systems (Debian/Ubuntu)
# 
# This script will:
# 1. Remove problematic Docker repositories
# 2. Remove old Node.js installations
# 3. Install Node.js 20 with npm from NodeSource
# 4. Install PM2 process manager
# 5. Verify everything is working
#
# Usage: bash fix-vps-nodejs.sh
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

###############################################################################
# STEP 1: Check if running as root
###############################################################################

if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo bash fix-vps-nodejs.sh)"
    exit 1
fi

print_success "Running as root"

###############################################################################
# STEP 2: Detect OS
###############################################################################

print_header "STEP 1: Detecting Operating System"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
    print_success "Detected: $PRETTY_NAME"
else
    print_error "Cannot detect OS. /etc/os-release not found."
    exit 1
fi

###############################################################################
# STEP 3: Remove Docker repositories (causing apt update to fail)
###############################################################################

print_header "STEP 2: Removing Problematic Repositories"

print_status "Checking for Docker repository files..."

# Remove Docker repository files
if ls /etc/apt/sources.list.d/docker*.list 1> /dev/null 2>&1; then
    print_warning "Found Docker repository files. Removing..."
    rm -f /etc/apt/sources.list.d/docker*.list
    print_success "Removed Docker repository files"
else
    print_success "No Docker repository files found"
fi

# Remove any archive_uri files (sometimes created by failed installs)
if ls /etc/apt/sources.list.d/archive_uri-*.list 1> /dev/null 2>&1; then
    print_warning "Found archive_uri files. Removing..."
    rm -f /etc/apt/sources.list.d/archive_uri-*.list
    print_success "Removed archive_uri files"
fi

# Check and remove Docker entries from main sources.list
if grep -qi docker /etc/apt/sources.list; then
    print_warning "Found Docker entries in /etc/apt/sources.list. Removing..."
    sed -i '/docker/d' /etc/apt/sources.list
    print_success "Removed Docker entries from sources.list"
else
    print_success "No Docker entries in sources.list"
fi

###############################################################################
# STEP 4: Remove old Node.js installations
###############################################################################

print_header "STEP 3: Removing Old Node.js Installations"

# Check if Node.js is installed
if command -v node &> /dev/null; then
    CURRENT_NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
    print_warning "Found Node.js $CURRENT_NODE_VERSION. Removing..."
    
    # Remove all Node.js related packages
    apt remove -y nodejs nodejs-doc libnode* node-* npm 2>/dev/null || true
    apt autoremove -y
    
    print_success "Removed old Node.js installation"
else
    print_success "No previous Node.js installation found"
fi

# Clean up apt cache
print_status "Cleaning apt cache..."
apt clean
print_success "Cleaned apt cache"

###############################################################################
# STEP 5: Update package lists (should work now)
###############################################################################

print_header "STEP 4: Updating Package Lists"

print_status "Running apt update..."
if apt update; then
    print_success "Package lists updated successfully"
else
    print_error "apt update failed. There may be other repository issues."
    print_warning "Attempting to continue anyway..."
fi

###############################################################################
# STEP 6: Install NodeSource repository for Node.js 20
###############################################################################

print_header "STEP 5: Installing NodeSource Repository"

print_status "Downloading NodeSource setup script..."
curl -fsSL https://deb.nodesource.com/setup_20.x -o /tmp/nodesource_setup.sh

if [ $? -eq 0 ]; then
    print_success "Downloaded NodeSource setup script"
else
    print_error "Failed to download NodeSource setup script"
    exit 1
fi

print_status "Running NodeSource setup script..."
bash /tmp/nodesource_setup.sh

if [ $? -eq 0 ]; then
    print_success "NodeSource repository configured"
else
    print_error "Failed to configure NodeSource repository"
    exit 1
fi

# Clean up
rm -f /tmp/nodesource_setup.sh

###############################################################################
# STEP 7: Install Node.js 20
###############################################################################

print_header "STEP 6: Installing Node.js 20"

print_status "Installing Node.js and npm..."
apt install -y nodejs

if [ $? -eq 0 ]; then
    print_success "Node.js installed successfully"
else
    print_error "Failed to install Node.js"
    exit 1
fi

###############################################################################
# STEP 8: Verify Node.js and npm installation
###############################################################################

print_header "STEP 7: Verifying Installation"

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
    
    # Check if it's version 20.x
    if [[ $NODE_VERSION == v20.* ]]; then
        print_success "Node.js 20.x installed correctly!"
    else
        print_warning "Expected Node.js 20.x but got $NODE_VERSION"
    fi
else
    print_error "Node.js command not found after installation"
    exit 1
fi

# Check npm version
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
else
    print_error "npm command not found after installation"
    exit 1
fi

###############################################################################
# STEP 9: Install PM2 globally
###############################################################################

print_header "STEP 8: Installing PM2 Process Manager"

print_status "Installing PM2 globally..."
npm install -g pm2

if [ $? -eq 0 ]; then
    print_success "PM2 installed successfully"
else
    print_error "Failed to install PM2"
    exit 1
fi

# Verify PM2
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 version: $PM2_VERSION"
else
    print_error "PM2 command not found after installation"
    exit 1
fi

###############################################################################
# STEP 10: Final verification
###############################################################################

print_header "STEP 9: Final Verification"

echo ""
print_success "All installations completed successfully!"
echo ""
echo -e "${BLUE}Installed versions:${NC}"
echo -e "  Node.js: ${GREEN}$(node --version)${NC}"
echo -e "  npm:     ${GREEN}$(npm --version)${NC}"
echo -e "  PM2:     ${GREEN}$(pm2 --version)${NC}"
echo ""

###############################################################################
# STEP 11: Next steps information
###############################################################################

print_header "Next Steps"

echo -e "${BLUE}Your VPS is now ready for deployment!${NC}"
echo ""
echo "To continue with deployment:"
echo ""
echo "1. Install Nginx:"
echo -e "   ${YELLOW}apt install -y nginx${NC}"
echo ""
echo "2. Configure firewall:"
echo -e "   ${YELLOW}ufw allow 22${NC}"
echo -e "   ${YELLOW}ufw allow 80${NC}"
echo -e "   ${YELLOW}ufw allow 443${NC}"
echo -e "   ${YELLOW}ufw enable${NC}"
echo ""
echo "3. Clone your repository:"
echo -e "   ${YELLOW}mkdir -p /var/www${NC}"
echo -e "   ${YELLOW}cd /var/www${NC}"
echo -e "   ${YELLOW}git clone https://github.com/nileshtheekshana/cryptohoru.git${NC}"
echo ""
echo "4. Follow the rest of HOSTING_GUIDE.md from STEP 4.2"
echo ""
echo -e "${GREEN}✓ Script completed successfully!${NC}"
echo ""

exit 0
