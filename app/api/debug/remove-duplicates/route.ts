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
    
    const amasCollection = db.collection('amas');
    
    // Get all documents
    const allDocs = await amasCollection.find({}).toArray();
    
    // Group by _id and find duplicates
    const idMap = new Map();
    const duplicatesToDelete: any[] = [];
    const emptyToDelete: any[] = [];
    
    for (const doc of allDocs) {
      const idStr = doc._id.toString();
      
      // Check if this is the empty broken entry
      if (!doc.title || doc.title === '' || !doc.date || doc.date === '') {
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
      const result = await amasCollection.deleteMany({
        _id: { $in: toDelete }
      });
      
      return NextResponse.json({ 
        success: true,
        message: `Deleted ${result.deletedCount} duplicate/empty AMAs`,
        deletedIds: toDelete.map(id => id.toString()),
        duplicatesDeleted: duplicatesToDelete.length,
        emptyDeleted: emptyToDelete.length
      });
    } else {
      return NextResponse.json({ 
        success: true,
        message: 'No duplicates or empty entries found'
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
