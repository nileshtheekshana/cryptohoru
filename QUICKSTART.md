# 🚀 Quick Start Guide - CryptoHoru Authentication

Get up and running in 5 minutes!

## ⚡ Fast Setup

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Configure Environment
Edit `.env.local` in the project root:

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cryptohoru

# NextAuth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your-random-secret-key-here

# App URL
NEXTAUTH_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## 🎯 Create Your Admin Account

### Option 1: Quick Method (via App)

1. Go to http://localhost:3000/auth/signup
2. Fill in your details and create account
3. Open MongoDB Atlas → Browse Collections
4. Find your user in the `users` collection
5. Edit the document and change `"role": "user"` to `"role": "admin"`
6. Log out and log back in
7. You'll now see the **Admin Panel** button!

### Option 2: Generate Hashed Password

```bash
# In your terminal:
node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 12))"
```

Copy the output, then in MongoDB Atlas:
- Go to your database → users collection
- Click "INSERT DOCUMENT"
- Paste this (replace the values):

```json
{
  "name": "Your Name",
  "email": "admin@yourdomain.com",
  "password": "PASTE_HASHED_PASSWORD_HERE",
  "role": "admin",
  "completedTasks": [],
  "followedAirdrops": [],
  "createdAt": {"$date": "2024-01-20T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-20T00:00:00.000Z"}
}
```

## ✅ Test Everything

### Test User Flow:
1. ✅ Go to http://localhost:3000/auth/signup
2. ✅ Create a test user account
3. ✅ Verify redirect to dashboard
4. ✅ Check navbar shows: Dashboard | Logout
5. ✅ Verify no "Admin Panel" button (regular users don't see it)

### Test Admin Flow:
1. ✅ Sign in with admin credentials at /auth/signin
2. ✅ Verify navbar shows: Dashboard | Admin Panel | Logout
3. ✅ Click "Admin Panel" → should access /admin
4. ✅ Try creating an airdrop with tasks
5. ✅ Verify airdrop appears on /airdrops page

### Test Dashboard:
1. ✅ Go to /airdrops (as logged-in user)
2. ✅ Future: Follow an airdrop (button coming soon)
3. ✅ Go to /dashboard
4. ✅ See your followed airdrops
5. ✅ Click tasks to mark as complete/incomplete
6. ✅ Watch progress bars update

## 🎨 What You Can Do Now

### As Admin:
- ✅ Create airdrops with unlimited dynamic tasks
- ✅ Edit existing airdrops
- ✅ Delete airdrops
- ✅ Manage tasks (add/edit/remove/reorder)

### As Regular User:
- ✅ Sign up for free account
- ✅ Browse all public pages
- ✅ View airdrops and their tasks
- ✅ Access personal dashboard
- ✅ Track progress on multiple airdrops

## 📱 Pages Overview

| Page | URL | Access | Purpose |
|------|-----|--------|---------|
| Home | `/` | Public | Landing page with features |
| Airdrops | `/airdrops` | Public | Browse all airdrops |
| AMA | `/ama` | Public | AMA sessions (content coming) |
| Giveaways | `/giveaways` | Public | Giveaways list |
| P2E Games | `/p2e-games` | Public | Play-to-earn games |
| News | `/news` | Public | Crypto news |
| Blog | `/blog` | Public | Blog posts |
| Sign Up | `/auth/signup` | Public | Create account |
| Sign In | `/auth/signin` | Public | Login |
| Dashboard | `/dashboard` | Users Only | Personal task tracking |
| Admin Panel | `/admin` | Admin Only | Content management |

## 🔐 Security Notes

✅ **Passwords are hashed** - Using bcrypt with 12 rounds  
✅ **Routes are protected** - Middleware blocks unauthorized access  
✅ **Sessions are secure** - JWT tokens with HTTP-only cookies  
✅ **Admin is hidden** - Regular users never see admin controls  
✅ **Role-based access** - Server-side validation  

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check `MONGODB_URI` in `.env.local`
- Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Ensure database user has read/write permissions

### "Invalid credentials"
- Double-check email and password
- Verify user exists in MongoDB
- For admin, ensure role is exactly `"admin"` (lowercase)

### "Admin Panel not showing"
- Log out and log back in after changing role
- Clear browser cookies
- Check user role in MongoDB is `"admin"`

### "Session errors"
- Restart dev server after changing `.env.local`
- Regenerate `AUTH_SECRET` with `openssl rand -base64 32`
- Clear browser cache and cookies

## 📚 Next Steps

1. **Test with real data** - Create some airdrops in admin panel
2. **Create test users** - Sign up a few test accounts
3. **Customize design** - Update colors/branding to match your style
4. **Add remaining content** - AMA, Giveaways, P2E, News, Blog forms

## 📖 Documentation

- `AUTHENTICATION_SETUP.md` - Detailed setup guide
- `AUTH_SUMMARY.md` - Complete system overview
- `MONGODB_SETUP.md` - Database configuration
- `DEPLOYMENT.md` - Production deployment guide

## 💡 Pro Tips

1. **Use different browsers** to test admin vs user experience
2. **Keep MongoDB Atlas tab open** to verify data is saving correctly
3. **Check Network tab** in DevTools if API calls fail
4. **Restart dev server** after changing environment variables

---

**Questions?** Check the documentation files or the code comments!

**Ready to go live?** See `DEPLOYMENT.md` for production setup.
