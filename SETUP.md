# CryptoHoru - Airdrop Posting Website

A comprehensive platform for managing crypto airdrops, AMA sessions, giveaways, P2E games, news, and blog posts.

## 🎯 Features

### For Users
- **Airdrops**: Browse active, upcoming, and ended airdrops with detailed task lists
- **AMA Sessions**: Join Ask Me Anything sessions with crypto projects
- **Giveaways**: Participate in crypto giveaways
- **P2E Games**: Discover Play-to-Earn gaming opportunities
- **Crypto News**: Stay updated with latest cryptocurrency news
- **Blog**: Read in-depth articles and guides

### For Admins
- **Dynamic Task Management**: Add tasks to airdrops over time as they progress
- **Full CRUD Operations**: Create, read, update, and delete all content types
- **Multi-Section Management**: Manage airdrops, AMA, giveaways, P2E games, news, and blog from one dashboard
- **MongoDB Integration**: All data persists in MongoDB Atlas (free tier)

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- MongoDB Atlas account (free)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up MongoDB** (see [MONGODB_SETUP.md](./MONGODB_SETUP.md)):
   - Create a MongoDB Atlas account
   - Create a free cluster
   - Get your connection string

3. **Configure environment variables**:
```bash
cp .env.local.example .env.local
# Edit .env.local and add your MongoDB connection string
```

4. **Run development server**:
```bash
npm run dev
```

5. **Open in browser**: http://localhost:3000

## 📁 Project Structure

```
cryptohoruweb/
├── app/
│   ├── admin/                 # Admin panel
│   │   └── airdrops/
│   │       └── new/          # Add new airdrop form
│   ├── airdrops/             # Airdrops page
│   ├── ama/                  # AMA sessions page
│   ├── giveaways/            # Giveaways page
│   ├── p2e-games/            # P2E games page
│   ├── news/                 # Crypto news page
│   ├── blog/                 # Blog page
│   ├── api/                  # API routes
│   │   └── airdrops/         # Airdrop CRUD endpoints
│   │       ├── route.ts      # GET all, POST new
│   │       └── [id]/
│   │           ├── route.ts  # GET, PUT, DELETE single
│   │           └── tasks/    # Task management
│   └── page.tsx              # Homepage
├── components/
│   └── Navbar.tsx            # Main navigation
├── lib/
│   └── mongodb.ts            # Database connection
├── models/
│   └── index.ts              # Mongoose models
├── MONGODB_SETUP.md          # Database setup guide
└── .env.local.example        # Environment template
```

## 🗄️ Database Models

### Airdrop Model
- Basic info: title, description, image, reward, blockchain
- Dates: startDate, endDate, status (active/upcoming/ended)
- Social links: website, twitter, telegram, discord
- **Tasks array**: Can add/remove tasks dynamically
  - Each task: title, description, type, reward, link, order
  - Task types: social, transaction, verification, quiz, other

### Other Models
- AMA: project, host, date, platform, rewards
- Giveaway: prize, winners, requirements, endDate
- Blog: title, content, author, tags, published
- P2E Game: blockchain, genre, tokenSymbol, features
- News: title, content, source, category, views

## 🔧 Key Features Explained

### Dynamic Task Management

Airdrops can run for months or even a year. This system allows you to:

1. **Create an airdrop** initially with 0 or few tasks
2. **Add tasks over time** as new requirements are announced
3. **Update tasks** if requirements change
4. **Delete tasks** if they're no longer needed
5. **Reorder tasks** by priority

Example workflow:
```
Month 1: Create airdrop with "Follow Twitter" task
Month 2: Add "Join Telegram" and "Complete Quiz" tasks
Month 3: Add "Make first transaction" task
Month 6: Add "Refer 5 friends" task
```

### API Endpoints

#### Airdrops
- `GET /api/airdrops` - Get all airdrops (with optional status filter)
- `POST /api/airdrops` - Create new airdrop
- `GET /api/airdrops/[id]` - Get single airdrop
- `PUT /api/airdrops/[id]` - Update airdrop
- `DELETE /api/airdrops/[id]` - Delete airdrop

#### Tasks
- `POST /api/airdrops/[id]/tasks` - Add task to airdrop
- `PUT /api/airdrops/[id]/tasks` - Update task
- `DELETE /api/airdrops/[id]/tasks?taskId=xxx` - Delete task

## 🎨 Admin Panel

Access at: `/admin`

### Adding an Airdrop

1. Go to Admin Dashboard
2. Click "Add New Airdrop"
3. Fill in basic information:
   - Title, description, image
   - Reward, blockchain, status
   - End date
4. Add social links (optional)
5. Add initial tasks (optional)
6. Click "Create Airdrop"

### Adding Tasks Later

1. Go to airdrop detail page
2. Click "Add Task"
3. Fill in task details
4. Save

Tasks will appear in order for users to complete.

## 🌐 Pages

- `/` - Homepage with feature overview
- `/airdrops` - All airdrops with filtering
- `/airdrops/[id]` - Airdrop details with task list
- `/ama` - AMA sessions listing
- `/giveaways` - Active giveaways
- `/p2e-games` - P2E games catalog
- `/news` - Latest crypto news
- `/blog` - Blog articles
- `/admin` - Admin dashboard (manage all content)

## 📱 Responsive Design

Fully responsive design works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

## 🎨 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Mongoose
- **Icons**: React Icons
- **Date Handling**: date-fns
- **Build Tool**: Turbopack

## 🔐 Security Notes

1. **Never commit .env.local** - It's in .gitignore
2. **Use strong passwords** for MongoDB users
3. **Whitelist specific IPs** in production (not 0.0.0.0/0)
4. **Add authentication** before deploying publicly (basic setup included)

## 🚀 Deployment

### For VPS Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

Quick steps:
1. Build: `npm run build`
2. Set environment variables on server
3. Start: `npm start`
4. Use PM2 for process management
5. Configure Nginx as reverse proxy

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
```

## 📊 MongoDB Free Tier Limits

- Storage: 512 MB (plenty for thousands of airdrops)
- RAM: Shared
- Bandwidth: No limit on free tier
- Perfect for small to medium projects

## 🐛 Troubleshooting

### "Failed to create airdrop"
- Check if MongoDB connection string is correct in `.env.local`
- Restart development server after adding `.env.local`
- Check MongoDB Atlas network access settings

### Tasks not saving
- Ensure MongoDB is connected
- Check browser console for API errors
- Verify task data is properly formatted

### Page shows "No data"
- Add content from admin panel first
- Check if MongoDB connection is working
- View MongoDB Atlas dashboard to confirm data exists

## 📚 Documentation

- [MongoDB Setup Guide](./MONGODB_SETUP.md) - How to set up MongoDB Atlas
- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to VPS
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Contributing

This is a private project, but you can:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

Private - All rights reserved © 2025

## 🆘 Support

For issues or questions:
1. Check the documentation files
2. Review MongoDB Atlas dashboard
3. Check browser console for errors
4. Verify all environment variables are set

---

**Built with ❤️ for the crypto community**
