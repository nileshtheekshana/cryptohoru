import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not connected' });
    }
    
    const collections = ['amas', 'airdrops', 'blogs', 'giveaways', 'news', 'p2egames'];
    const results: any = {};
    let totalDeleted = 0;
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      
      // Get all documents
      const allDocs = await collection.find({}).toArray();
      
      // Group by _id and find duplicates
      const idMap = new Map();
      const duplicatesToDelete: any[] = [];
      const emptyToDelete: any[] = [];
      
      for (const doc of allDocs) {
        const idStr = doc._id.toString();
        
        // Check if this is an empty/broken entry
        if (!doc.title || doc.title === '' || !doc.description || doc.description === '') {
          emptyToDelete.push(doc._id);
          continue;
        }
        
        // Check for duplicates
        if (idMap.has(idStr)) {
          // This is a duplicate, mark for deletion (keep first occurrence)
          duplicatesToDelete.push(doc._id);
        } else {
          idMap.set(idStr, doc);
        }
      }
      
      // Delete duplicates and empty entries
      const toDelete = [...duplicatesToDelete, ...emptyToDelete];
      
      if (toDelete.length > 0) {
        const result = await collection.deleteMany({
          _id: { $in: toDelete }
        });
        
        results[collectionName] = {
          duplicatesDeleted: duplicatesToDelete.length,
          emptyDeleted: emptyToDelete.length,
          totalDeleted: result.deletedCount,
          deletedIds: toDelete.map(id => id.toString())
        };
        
        totalDeleted += result.deletedCount;
      } else {
        results[collectionName] = {
          duplicatesDeleted: 0,
          emptyDeleted: 0,
          totalDeleted: 0,
          message: 'No duplicates or empty entries found'
        };
      }
    }
    
    return NextResponse.json({ 
      success: true,
      totalDeleted,
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
