import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Direct MongoDB query to bypass Mongoose models
    const db = mongoose.connection.db;
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not connected' 
      });
    }
    
    // List all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Try to get data from 'amas' collection directly
    const amasCollection = db.collection('amas');
    const amasCount = await amasCollection.countDocuments();
    const amasDocs = await amasCollection.find({}).limit(5).toArray();
    
    return NextResponse.json({ 
      success: true,
      database: db.databaseName,
      collections: collectionNames,
      amasCollection: {
        exists: collectionNames.includes('amas'),
        count: amasCount,
        sampleDocs: amasDocs
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
