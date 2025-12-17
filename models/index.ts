import mongoose, { Schema, model } from 'mongoose';

// Task Schema - for airdrop tasks that can be added over time
const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['social', 'transaction', 'verification', 'quiz', 'other'], default: 'other' },
  reward: { type: String },
  link: { type: String },
  status: { type: String, enum: ['ongoing', 'ended'], default: 'ongoing' },
  endDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Airdrop Schema
const AirdropSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  image: { type: String },
  category: { type: String, default: 'Airdrop' },
  reward: { type: String },
  blockchain: { type: String },
  status: { type: String, enum: ['active', 'upcoming', 'ended', 'hidden'], default: 'active' },
  startDate: { type: Date },
  endDate: { type: Date },
  tasks: [TaskSchema],
  tags: [{ type: String }],
  website: { type: String },
  twitter: { type: String },
  telegram: { type: String },
  discord: { type: String },
  requirements: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// AMA Schema
const AMASchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  image: { type: String },
  project: { type: String, required: true },
  host: { type: String },
  date: { type: Date, required: true },
  platform: { type: String },
  link: { type: String },
  rewards: { type: String },
  preAMA: { type: Boolean, default: false }, // Pre-AMA activities indicator
  preAMADetails: { type: String }, // Details about pre-AMA activities
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'hidden'], default: 'upcoming' },
  tags: [{ type: String }],
  liveReminderSent: { type: Boolean, default: false }, // Track live notification
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Giveaway Schema
const GiveawaySchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  image: { type: String },
  prize: { type: String, required: true },
  winners: { type: Number, default: 1 },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'ended', 'hidden'], default: 'active' },
  requirements: [{ type: String }],
  tasks: [TaskSchema],
  link: { type: String },
  tags: [{ type: String }],
  oneDayReminderSent: { type: Boolean, default: false }, // Track 24h reminder
  oneHourReminderSent: { type: Boolean, default: false }, // Track 1h reminder
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Blog Schema
const BlogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  excerpt: { type: String },
  content: { type: String, required: true },
  image: { type: String },
  imageUrl: { type: String },
  author: { type: String, default: 'CryptoHoru Team' },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  published: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// P2E Game Schema
const P2EGameSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  image: { type: String },
  blockchain: { type: String },
  gameType: { type: String },
  genre: { type: String },
  tokenSymbol: { type: String },
  earnings: { type: String },
  playToEarnMechanism: { type: String },
  playLink: { type: String },
  websiteUrl: { type: String },
  status: { 
    type: String, 
    enum: ['active', 'coming-soon', 'inactive', 'hidden'], 
    default: 'active' 
  },
  website: { type: String },
  twitter: { type: String },
  discord: { type: String },
  whitepaper: { type: String },
  requirements: [{ type: String }],
  features: [{ type: String }],
  tasks: [TaskSchema],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Crypto News Schema
const NewsSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  content: { type: String, required: true },
  image: { type: String },
  imageUrl: { type: String },
  author: { type: String, default: 'CryptoHoru Team' },
  source: { type: String },
  sourceUrl: { type: String },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  published: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// User Schema (for both admin and regular users)
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  timezone: { type: String, default: 'Asia/Kolkata' }, // User's preferred timezone
  emailVerified: { type: Date },
  completedTasks: [{
    airdropId: { type: Schema.Types.ObjectId, ref: 'Airdrop' },
    taskId: { type: String },
    completedAt: { type: Date, default: Date.now },
  }],
  completedGiveawayTasks: [{
    giveawayId: { type: Schema.Types.ObjectId, ref: 'Giveaway' },
    taskId: { type: String },
    completedAt: { type: Date, default: Date.now },
  }],
  completedP2ETasks: [{
    gameId: { type: Schema.Types.ObjectId, ref: 'P2EGame' },
    taskId: { type: String },
    completedAt: { type: Date, default: Date.now },
  }],
  followedAirdrops: [{ type: Schema.Types.ObjectId, ref: 'Airdrop' }],
  followedGiveaways: [{ type: Schema.Types.ObjectId, ref: 'Giveaway' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Export models with safe checking using optional chaining
export const Airdrop = mongoose.models?.Airdrop || model('Airdrop', AirdropSchema);
export const AMA = mongoose.models?.AMA || model('AMA', AMASchema);
export const Giveaway = mongoose.models?.Giveaway || model('Giveaway', GiveawaySchema);
export const Blog = mongoose.models?.Blog || model('Blog', BlogSchema);
export const P2EGame = mongoose.models?.P2EGame || model('P2EGame', P2EGameSchema);
export const News = mongoose.models?.News || model('News', NewsSchema);
export const User = mongoose.models?.User || model('User', UserSchema);
