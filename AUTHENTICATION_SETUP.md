# Authentication Setup Guide

This guide walks you through setting up the authentication system for CryptoHoru.

## 📋 Prerequisites

- MongoDB Atlas account (free tier is sufficient)
- Node.js 20+ installed
- npm or yarn package manager

## 🔧 Setup Steps

### 1. Configure Environment Variables

Create or update `.env.local` in the project root with the following:

```bash
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cryptohoru?retryWrites=true&w=majority

# NextAuth Configuration
AUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=http://localhost:3000
```

#### Generate AUTH_SECRET:
Run this command in your terminal to generate a secure secret:
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `AUTH_SECRET` value.

### 2. Create Admin User

Since the admin login is hidden, you need to create your admin account directly in MongoDB:

#### Option A: Using MongoDB Atlas Web Interface

1. Go to your MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select your database (`cryptohoru`)
4. Select the `users` collection
5. Click "INSERT DOCUMENT"
6. Add this document (replace with your details):

```json
{
  "name": "Your Name",
  "email": "admin@yourdomain.com",
  "password": "$2a$12$HASHED_PASSWORD_HERE",
  "role": "admin",
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "completedTasks": [],
  "followedAirdrops": []
}
```

#### Generate Hashed Password:

You can use this Node.js script to generate a hashed password:

```javascript
const bcrypt = require('bcryptjs');
const password = 'YourSecurePassword123!';
const hashed = bcrypt.hashSync(password, 12);
console.log(hashed);
```

Or run this in your terminal:
```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword', 12))"
```

#### Option B: Using the Application (Temporary)

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/auth/signup`
3. Create your admin account
4. Stop the server
5. Update the user's role in MongoDB from `user` to `admin`

### 3. Access the Admin Panel

Once your admin user is created:

1. Go to `http://localhost:3000/auth/signin`
2. Sign in with your admin credentials
3. You'll be redirected to your dashboard
4. The **Admin Panel** button will appear in the navbar (only visible to admin users)
5. Click **Admin Panel** to access `/admin`

## 🔐 Authentication Flow

### For Admin:
1. Navigate to `/auth/signin`
2. Enter admin credentials
3. Access admin panel via navbar button
4. Create and manage content (airdrops, AMA, giveaways, etc.)

### For Regular Users:
1. Sign up at `/auth/signup`
2. Sign in at `/auth/signin`
3. Browse airdrops
4. Click "Follow" on any airdrop to add it to their dashboard
5. Mark tasks as completed in their dashboard at `/dashboard`

## 📱 Protected Routes

- `/admin/*` - Requires authentication + admin role
- `/dashboard` - Requires authentication (any user)
- All other pages are public

## 🎨 User Features

### Dashboard (`/dashboard`)
- View all followed airdrops
- Track task completion progress
- Mark individual tasks as complete/incomplete
- See total stats (following, tasks completed, etc.)
- Unfollow airdrops

### Airdrop Pages (`/airdrops`)
- Browse all airdrops
- Filter by status (active, upcoming, ended)
- Follow/unfollow individual airdrops
- View detailed task lists

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers (signin, signout, session)

### User Management
- `GET /api/users/me` - Get current user profile
- `POST /api/users/follow-airdrop` - Follow an airdrop
- `DELETE /api/users/follow-airdrop` - Unfollow an airdrop
- `POST /api/users/complete-task` - Mark task as completed
- `DELETE /api/users/complete-task` - Unmark task

### Content Management (Admin Only)
- `GET /api/airdrops` - Get all airdrops
- `POST /api/airdrops` - Create new airdrop
- `GET /api/airdrops/[id]` - Get specific airdrop
- `PUT /api/airdrops/[id]` - Update airdrop
- `DELETE /api/airdrops/[id]` - Delete airdrop
- `POST /api/airdrops/[id]/tasks` - Add task to airdrop
- `PUT /api/airdrops/[id]/tasks` - Update task
- `DELETE /api/airdrops/[id]/tasks` - Remove task

## 🔍 Troubleshooting

### "Invalid credentials" error
- Verify your email is correct
- Check that password matches what's in MongoDB
- Ensure the password was hashed correctly with bcrypt

### Admin button not showing
- Verify your user's role is set to `"admin"` in MongoDB
- Check your session by logging out and back in
- Clear browser cache and cookies

### Can't access admin panel
- Ensure `.env.local` has correct `AUTH_SECRET`
- Restart the dev server after changing environment variables
- Check MongoDB connection is working

### Session/JWT errors
- Regenerate `AUTH_SECRET` with `openssl rand -base64 32`
- Clear all cookies for localhost:3000
- Restart the development server

## 📝 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Use strong passwords** - Minimum 8 characters with mixed case, numbers, symbols
3. **Keep AUTH_SECRET secure** - Generate a new one for production
4. **Admin access is hidden** - Regular users won't see admin controls
5. **Middleware protection** - Routes are protected server-side

## 🚀 Production Deployment

For production deployment (e.g., Vercel, Netlify):

1. Add environment variables in your hosting platform:
   - `MONGODB_URI`
   - `AUTH_SECRET` (generate a new one!)
   - `NEXTAUTH_URL` (your production domain)

2. Create admin user in production MongoDB

3. Test authentication flow thoroughly before going live

## 📚 Next Steps

After authentication is set up:
1. Create remaining admin forms (AMA, Giveaways, P2E, News, Blog)
2. Build API routes for other content types
3. Enhance user dashboard with analytics
4. Add email notifications for new airdrops
5. Implement social sharing features

---

**Need Help?** Check the main README.md or create an issue on GitHub.
