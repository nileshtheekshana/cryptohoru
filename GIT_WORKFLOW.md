# 🔄 Git Workflow Guide

## ✅ Initial Setup Complete!

Your Git repository is initialized and your first commit is done! 

**Commit:** `3ecee99` - Initial commit with 55 files, 13,270 lines of code

---

## 🚀 Next Steps: Push to GitHub

### 1. Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `cryptohoru` (or any name you want)
3. Description: "CryptoHoru - Airdrop posting platform with task tracking"
4. **Keep it Private** (recommended until ready to go public)
5. **Don't** initialize with README (you already have one)
6. Click "Create repository"

### 2. Push Your Code to GitHub

GitHub will show you commands. Use these:

```bash
cd /home/nilesh/Desktop/cryptohoruweb

# Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/cryptohoru.git

# Push your code
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

---

## 📝 Daily Workflow (Making Changes)

### Scenario: You fixed a bug or added a feature

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# Or add specific files:
git add app/admin/page.tsx
git add components/Navbar.tsx

# 3. Commit with a message
git commit -m "Fixed navbar responsive menu bug"

# 4. Push to GitHub
git push origin main
```

### Good Commit Messages

✅ **Good:**
- "Add user authentication with NextAuth"
- "Fix MongoDB connection timeout issue"
- "Update dashboard to show progress bars"
- "Create admin forms for AMA sessions"

❌ **Bad:**
- "Update"
- "Changes"
- "Fix stuff"
- "asdf"

---

## 🔍 Common Git Commands

### Check Status
```bash
git status
# Shows what files changed, what's staged, etc.
```

### View Commit History
```bash
git log
# Press 'q' to exit

# Or prettier version:
git log --oneline --graph --decorate
```

### View Changes
```bash
# See what changed in files
git diff

# See changes in staged files
git diff --staged
```

### Undo Changes

```bash
# Undo changes to a file (before adding)
git checkout -- filename.txt

# Unstage a file (after git add)
git reset HEAD filename.txt

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) ⚠️ CAREFUL!
git reset --hard HEAD~1
```

### Pull Latest Changes (from VPS or teammates)
```bash
git pull origin main
```

---

## 🌿 Branching (For Experimental Features)

### Create and Switch to New Branch
```bash
# Create a new branch for a feature
git checkout -b feature/user-profiles

# Make changes...
# Commit changes...

# Switch back to main
git checkout main

# Merge feature into main
git merge feature/user-profiles

# Delete branch after merge
git branch -d feature/user-profiles
```

### Why Use Branches?
- Test risky changes without breaking main
- Work on multiple features simultaneously
- Easy to discard if experiment fails

---

## 🔧 Git Configuration

### View Current Config
```bash
git config --list
```

### Update Your Info
```bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use GitHub email)
git config --global user.email "your-github-email@example.com"

# Set default branch name to 'main'
git config --global init.defaultBranch main

# Better log colors
git config --global color.ui auto
```

### Setup SSH (Optional but Recommended)

Instead of username/password, use SSH keys:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for all prompts

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. Go to GitHub Settings > SSH and GPG keys
# 2. Click "New SSH key"
# 3. Paste the key
# 4. Save

# Change remote to use SSH
git remote set-url origin git@github.com:YOUR-USERNAME/cryptohoru.git

# Now you can push without password!
git push origin main
```

---

## 📦 Handling .env.local

**NEVER commit sensitive files!**

Your `.gitignore` already blocks `.env*` files, but be careful:

```bash
# Check if .env.local is ignored
git status
# Should NOT see .env.local in the list

# If you accidentally added it:
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"
```

---

## 🚀 VPS Deployment Workflow

### First Time on VPS:
```bash
# SSH into VPS
ssh username@vps-ip

# Clone from GitHub
cd /var/www
git clone https://github.com/YOUR-USERNAME/cryptohoru.git
cd cryptohoru

# Setup (see DEPLOYMENT_VPS.md)
npm install
# ... rest of setup
```

### Updating VPS:
```bash
# On Local Machine:
git add .
git commit -m "Update feature X"
git push origin main

# On VPS:
ssh username@vps-ip
cd /var/www/cryptohoru
git pull origin main
npm install
npm run build
pm2 restart cryptohoru
```

---

## 🔄 Complete Update Workflow Example

Let's say you want to add a new admin form:

### Step 1: Local Development
```bash
cd /home/nilesh/Desktop/cryptohoruweb

# Create the new form
nano app/admin/ama/new/page.tsx
# ... write your code ...

# Test it
npm run dev
# Visit http://localhost:3000/admin/ama/new
# Make sure it works
```

### Step 2: Commit & Push
```bash
# Stage changes
git add app/admin/ama/new/page.tsx

# Commit
git commit -m "Add AMA admin form with validation"

# Push to GitHub
git push origin main
```

### Step 3: Deploy to VPS
```bash
# SSH into VPS
ssh username@vps-ip

# Pull changes
cd /var/www/cryptohoru
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart cryptohoru

# Check logs
pm2 logs cryptohoru
```

### Step 4: Verify
Visit your live site and test the new feature!

---

## 📊 Git Workflow Diagram

```
Local Machine (Kali Linux)          GitHub              VPS (Production)
─────────────────────────────────────────────────────────────────────────

1. Edit code                          │                   │
   npm run dev (test)                 │                   │
                                      │                   │
2. git add .                          │                   │
   git commit -m "message"            │                   │
                                      │                   │
3. git push origin main          ──────>  Stores code     │
                                      │                   │
4.                                    │   git pull  <──────  
                                      │   npm run build    
                                      │   pm2 restart      
                                      │                   │
5.                                    │              Live website! 🎉
```

---

## 🆘 Troubleshooting

### "Permission denied" when pushing
- Setup SSH keys (see above)
- Or use personal access token instead of password

### "Merge conflict" error
```bash
# See conflicting files
git status

# Open the files and fix conflicts (look for <<<< ==== >>>>)
# Then:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### "Your branch is behind"
```bash
# Pull latest changes first
git pull origin main

# Then push your changes
git push origin main
```

### Accidentally committed sensitive data
```bash
# Remove from history (CAREFUL!)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin main --force

# Change your secrets immediately!
```

---

## 🎯 Quick Reference Card

```bash
# Status & Info
git status              # What changed?
git log --oneline       # Commit history
git diff                # See changes

# Basic Workflow
git add .               # Stage all changes
git add file.txt        # Stage specific file
git commit -m "msg"     # Commit with message
git push origin main    # Push to GitHub

# Undo Operations
git checkout -- file    # Discard changes
git reset HEAD file     # Unstage file
git reset --soft HEAD~1 # Undo last commit

# Branches
git branch              # List branches
git checkout -b name    # Create & switch
git merge branch-name   # Merge branch

# Remote Operations
git pull origin main    # Download changes
git push origin main    # Upload changes
git remote -v           # View remotes
```

---

## 📚 Learn More

- **Git Documentation:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Interactive Tutorial:** https://learngitbranching.js.org/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

---

## ✅ Your Current Status

**Repository:** Initialized ✅
**First Commit:** Done ✅ (55 files, 13,270 lines)
**Branch:** main
**Remote:** Not yet configured
**Next Step:** Create GitHub repo and push

---

**Ready to push to GitHub?** Follow "Next Steps" at the top of this file!
