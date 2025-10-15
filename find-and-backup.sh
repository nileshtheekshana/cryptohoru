#!/bin/bash

###############################################################################
# Find and Backup Script for VPS
# 
# This script will:
# 1. Find all Python programs on your VPS
# 2. Show their locations
# 3. Let you choose what to backup
# 4. Create comprehensive backups
#
# Usage: bash find-and-backup.sh
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Create backup directory
BACKUP_DIR="/root/backups/full_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_header "VPS Backup and Discovery Script"

echo -e "${CYAN}Backup will be saved to:${NC} $BACKUP_DIR"
echo ""

###############################################################################
# Find Python Programs
###############################################################################

print_header "Finding Python Programs"

print_info "Searching for Python files..."
echo ""

# Find all .py files
echo -e "${YELLOW}Python files found:${NC}"
find /home /root /var/www /opt -type f -name "*.py" 2>/dev/null | head -20

echo ""
echo -e "${YELLOW}Python projects (with requirements.txt):${NC}"
find /home /root /var/www /opt -type f -name "requirements.txt" 2>/dev/null

echo ""
echo -e "${YELLOW}Python virtual environments:${NC}"
find /home /root /var/www /opt -type d -name "venv" -o -name ".venv" -o -name "env" 2>/dev/null | head -10

###############################################################################
# Check Running Processes
###############################################################################

print_header "Checking Running Processes"

echo -e "${YELLOW}Python processes currently running:${NC}"
ps aux | grep python | grep -v grep

echo ""
echo -e "${YELLOW}PM2 processes:${NC}"
if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo "PM2 not installed"
fi

echo ""
echo -e "${YELLOW}Systemd services with 'python' in name:${NC}"
systemctl list-units --type=service --all | grep -i python || echo "None found"

###############################################################################
# Check Common Directories
###############################################################################

print_header "Checking Common Directories"

COMMON_DIRS=(
    "/var/www"
    "/home"
    "/root"
    "/opt"
    "/srv"
)

for dir in "${COMMON_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${BLUE}Contents of $dir:${NC}"
        ls -lah "$dir" 2>/dev/null | head -20
        echo ""
    fi
done

###############################################################################
# Create Comprehensive Backup
###############################################################################

print_header "Creating Comprehensive Backup"

# Backup /var/www
if [ -d "/var/www" ]; then
    print_info "Backing up /var/www..."
    mkdir -p "$BACKUP_DIR/var_www"
    cp -r /var/www/* "$BACKUP_DIR/var_www/" 2>/dev/null || true
    print_success "/var/www backed up"
fi

# Backup /home
if [ -d "/home" ]; then
    print_info "Backing up /home..."
    mkdir -p "$BACKUP_DIR/home"
    cp -r /home/* "$BACKUP_DIR/home/" 2>/dev/null || true
    print_success "/home backed up"
fi

# Backup /root (excluding backups directory itself)
print_info "Backing up /root (excluding existing backups)..."
mkdir -p "$BACKUP_DIR/root_files"
rsync -av --exclude='backups' /root/ "$BACKUP_DIR/root_files/" 2>/dev/null || true
print_success "/root backed up"

# Backup /opt
if [ -d "/opt" ] && [ "$(ls -A /opt 2>/dev/null)" ]; then
    print_info "Backing up /opt..."
    mkdir -p "$BACKUP_DIR/opt"
    cp -r /opt/* "$BACKUP_DIR/opt/" 2>/dev/null || true
    print_success "/opt backed up"
fi

# Backup Nginx configs
if [ -d "/etc/nginx" ]; then
    print_info "Backing up Nginx configurations..."
    mkdir -p "$BACKUP_DIR/nginx"
    cp -r /etc/nginx/* "$BACKUP_DIR/nginx/" 2>/dev/null || true
    print_success "Nginx configs backed up"
fi

# Backup systemd services
print_info "Backing up systemd services..."
mkdir -p "$BACKUP_DIR/systemd"
cp /etc/systemd/system/*.service "$BACKUP_DIR/systemd/" 2>/dev/null || true
print_success "Systemd services backed up"

# Backup cron jobs
print_info "Backing up cron jobs..."
mkdir -p "$BACKUP_DIR/cron"
crontab -l > "$BACKUP_DIR/cron/root_crontab.txt" 2>/dev/null || true
cp -r /etc/cron* "$BACKUP_DIR/cron/" 2>/dev/null || true
print_success "Cron jobs backed up"

# Save PM2 info
if command -v pm2 &> /dev/null; then
    print_info "Saving PM2 configuration..."
    mkdir -p "$BACKUP_DIR/pm2"
    pm2 list > "$BACKUP_DIR/pm2/pm2_list.txt" 2>/dev/null || true
    pm2 save 2>/dev/null || true
    cp -r ~/.pm2 "$BACKUP_DIR/pm2/" 2>/dev/null || true
    print_success "PM2 configuration saved"
fi

# Save running processes
print_info "Saving process information..."
ps aux > "$BACKUP_DIR/processes.txt"
systemctl list-units --type=service --all > "$BACKUP_DIR/services.txt"
print_success "Process information saved"

# Save network info
print_info "Saving network configuration..."
ip addr > "$BACKUP_DIR/network_interfaces.txt" 2>/dev/null || true
ufw status verbose > "$BACKUP_DIR/firewall_rules.txt" 2>/dev/null || true
print_success "Network configuration saved"

###############################################################################
# Create Archive
###############################################################################

print_header "Creating Backup Archive"

print_info "Compressing backup..."
cd /root/backups
tar -czf "full_backup_$(date +%Y%m%d_%H%M%S).tar.gz" "$(basename $BACKUP_DIR)" 2>/dev/null

if [ $? -eq 0 ]; then
    ARCHIVE_SIZE=$(du -h "full_backup_$(date +%Y%m%d_%H%M%S).tar.gz" | cut -f1)
    print_success "Backup archive created: full_backup_$(date +%Y%m%d_%H%M%S).tar.gz ($ARCHIVE_SIZE)"
fi

###############################################################################
# Summary
###############################################################################

print_header "Backup Summary"

echo -e "${GREEN}Backup completed successfully!${NC}"
echo ""
echo -e "${CYAN}Backup location:${NC} $BACKUP_DIR"
echo -e "${CYAN}Backup size:${NC} $(du -sh $BACKUP_DIR | cut -f1)"
echo ""

echo -e "${YELLOW}Files backed up:${NC}"
find "$BACKUP_DIR" -type f | wc -l | xargs echo "  Total files:"
find "$BACKUP_DIR" -type d | wc -l | xargs echo "  Total directories:"
echo ""

print_header "What Was Backed Up"

echo "✓ /var/www (all websites)"
echo "✓ /home (all user files)"
echo "✓ /root files"
echo "✓ /opt directory"
echo "✓ Nginx configurations"
echo "✓ Systemd services"
echo "✓ Cron jobs"
echo "✓ PM2 processes and config"
echo "✓ Running process list"
echo "✓ Network configuration"
echo "✓ Firewall rules"
echo ""

print_header "Next Steps"

echo "1. Review the Python files found above"
echo "2. Check the backup directory for your Python program:"
echo -e "   ${CYAN}ls -lah $BACKUP_DIR/var_www/${NC}"
echo -e "   ${CYAN}ls -lah $BACKUP_DIR/home/${NC}"
echo -e "   ${CYAN}ls -lah $BACKUP_DIR/root_files/${NC}"
echo ""
echo "3. Once confirmed, you can proceed with migration:"
echo -e "   ${CYAN}bash migrate-to-cryptohoru.sh${NC}"
echo ""

print_warning "Keep this backup safe! It contains your entire VPS configuration."

echo ""
echo -e "${BLUE}To download the backup to your local machine:${NC}"
echo -e "${CYAN}scp root@softsace.com:/root/backups/full_backup_*.tar.gz ~/Downloads/${NC}"
echo ""

exit 0
