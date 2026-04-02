# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (free tier) and connect it to your CryptoHoru application.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create a Cluster (Free Tier)

1. After logging in, click **"Build a Database"**
2. Select **"M0 FREE"** tier (Free Forever)
3. Choose your preferred **Cloud Provider & Region** (choose closest to your location)
4. Give your cluster a name (e.g., `cryptohoru-cluster`)
5. Click **"Create"**

Wait a few minutes for your cluster to be created.

## Step 3: Create Database User

1. Click on **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Set a username (e.g., `cryptohoru_admin`)
5. **Generate a strong password** and save it securely
6. Under **"Database User Privileges"**, select **"Read and write to any database"**
7. Click **"Add User"**

**Important:** Save your username and password - you'll need them for the connection string!

## Step 4: Configure Network Access

1. Click on **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production, add only your VPS IP address
4. Click **"Confirm"**

## Step 5: Get Your Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose **"Node.js"** as the driver
5. Copy the connection string (it will look like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Configure Your Application

1. In your project root, create a file named `.env.local`:
   ```bash
   touch .env.local
   ```

2. Add your MongoDB connection string to `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://cryptohoru_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cryptohoru?retryWrites=true&w=majority
   ```

   **Replace:**
   - `YOUR_PASSWORD` with the password you created in Step 3
   - `cluster0.xxxxx` with your actual cluster address
   - Add `/cryptohoru` before the `?` to specify the database name

3. **Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

## Step 7: Test Your Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to: `http://localhost:3000/admin`

3. Try to add an airdrop - if successful, your database is connected!

## Example Connection String

```env
# Before (template):
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# After (filled in):
mongodb+srv://cryptohoru_admin:MySecurePass123@cluster0.ab1cd.mongodb.net/cryptohoru?retryWrites=true&w=majority
```

## Troubleshooting

### Error: "MongoServerError: bad auth"
- Double-check your username and password
- Make sure there are no special characters in your password that need URL encoding
- If your password has special characters, encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - etc.

### Error: "MongoNetworkError: connection timed out"
- Check Network Access settings in MongoDB Atlas
- Make sure your IP is whitelisted (or use 0.0.0.0/0 for testing)

### Error: "MONGODB_URI is not defined"
- Make sure `.env.local` exists in your project root
- Restart your development server after creating `.env.local`

## MongoDB Atlas Features (Free Tier)

Your free tier includes:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Shared CPU
- ✅ No credit card required
- ✅ Perfect for development and small projects

This is more than enough for your airdrop posting website!

## Viewing Your Data

1. In MongoDB Atlas Dashboard, click **"Browse Collections"**
2. You'll see all your collections (airdrops, ama, giveaways, etc.)
3. You can view, edit, and delete documents directly from the web interface

## Backup (Optional but Recommended)

Free tier includes:
- Automated backups (retained for 2 days)
- Manual snapshots not available on free tier

For production, consider upgrading to a paid tier for better backup options.

## Next Steps

Once your database is connected:
1. ✅ Go to `/admin` to add content
2. ✅ Add airdrops with tasks
3. ✅ Add more tasks to ongoing airdrops over time
4. ✅ Manage all your content from the admin panel

---

Need help? Check the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
