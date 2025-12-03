/**
 * Migration Script: Add slugs to existing content
 * 
 * Run with: npx ts-node scripts/migrate-slugs.ts
 * Or: npx tsx scripts/migrate-slugs.ts
 * 
 * This script will add SEO-friendly slugs to all existing content
 * that doesn't already have a slug.
 */

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnvFile();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Generate slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
    .substring(0, 80);         // Limit length
}

// Generate unique slug with ID suffix
function generateUniqueSlug(text: string, id: string): string {
  const baseSlug = generateSlug(text);
  const idSuffix = id.slice(-6); // Last 6 characters of ObjectId
  return `${baseSlug}-${idSuffix}`;
}

async function migrateCollection(
  collectionName: string,
  titleField: string = 'title'
) {
  const collection = mongoose.connection.collection(collectionName);
  
  // Find all documents without a slug
  const docs = await collection.find({ 
    slug: { $exists: false } 
  }).toArray();
  
  if (docs.length === 0) {
    console.log(`✅ ${collectionName}: No documents need migration`);
    return 0;
  }
  
  console.log(`📝 ${collectionName}: Migrating ${docs.length} documents...`);
  
  let updated = 0;
  for (const doc of docs) {
    const title = doc[titleField];
    if (!title) {
      console.log(`  ⚠️  Skipping document ${doc._id} - no ${titleField} field`);
      continue;
    }
    
    const slug = generateUniqueSlug(title, doc._id.toString());
    
    await collection.updateOne(
      { _id: doc._id },
      { $set: { slug } }
    );
    
    console.log(`  ✓ ${title.substring(0, 40)}... → ${slug}`);
    updated++;
  }
  
  console.log(`✅ ${collectionName}: Updated ${updated} documents\n`);
  return updated;
}

async function main() {
  console.log('🚀 Starting slug migration...\n');
  
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB\n');
    
    let totalUpdated = 0;
    
    // Migrate each collection
    totalUpdated += await migrateCollection('airdrops', 'title');
    totalUpdated += await migrateCollection('amas', 'title');
    totalUpdated += await migrateCollection('giveaways', 'title');
    totalUpdated += await migrateCollection('blogs', 'title');
    totalUpdated += await migrateCollection('news', 'title');
    totalUpdated += await migrateCollection('p2egames', 'name');
    
    console.log(`\n🎉 Migration complete! Updated ${totalUpdated} documents total.`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

main();
