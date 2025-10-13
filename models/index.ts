import mongoose, { Schema, model } from 'mongoose';

// Task Schema - for airdrop tasks that can be added over time
const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['social', 'transaction', 'verification', 'quiz', 'other'], default: 'other' },
  reward: { type: String },
  link: { type: String },
  isCompleted: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Airdrop Schema
const AirdropSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  category: { type: String, default: 'Airdrop' },
  reward: { type: String },
  blockchain: { type: String },
  status: { type: String, enum: ['active', 'upcoming', 'ended'], default: 'active' },
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
  description: { type: String, required: true },
  image: { type: String },
  project: { type: String, required: true },
  host: { type: String },
  date: { type: Date, required: true },
  platform: { type: String },
  link: { type: String },
  rewards: { type: String },
  status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Giveaway Schema
const GiveawaySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  prize: { type: String, required: true },
  winners: { type: Number, default: 1 },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  requirements: [{ type: String }],
  link: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Blog Schema
const BlogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  content: { type: String, required: true },
  image: { type: String },
  author: { type: String, default: 'CryptoHoru Team' },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// P2E Game Schema
const P2EGameSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  blockchain: { type: String },
  genre: { type: String },
  tokenSymbol: { type: String },
  playToEarnMechanism: { type: String },
  status: { type: String, enum: ['launched', 'beta', 'upcoming'], default: 'launched' },
  website: { type: String },
  twitter: { type: String },
  discord: { type: String },
  whitepaper: { type: String },
  requirements: [{ type: String }],
  features: [{ type: String }],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Crypto News Schema
const NewsSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
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
  emailVerified: { type: Date },
  completedTasks: [{
    airdropId: { type: Schema.Types.ObjectId, ref: 'Airdrop' },
    taskId: { type: String },
    completedAt: { type: Date, default: Date.now },
  }],
  followedAirdrops: [{ type: Schema.Types.ObjectId, ref: 'Airdrop' }],
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
