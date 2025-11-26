import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not connected' });
    }
    
    // Get all documents from amas collection
    const amasCollection = db.collection('amas');
    const allDocs = await amasCollection.find({}).toArray();
    
    // Check each document to see if it looks like an airdrop instead of an AMA
    const suspiciousDocs = allDocs.filter(doc => {
      // AMAs should have: project, host, platform
      // Airdrops have: blockchain, reward, tasks, requirements
      const hasAirdropFields = doc.blockchain || doc.tasks || doc.requirements;
      const missingAMAFields = !doc.project && !doc.host;
      
      return hasAirdropFields || missingAMAFields;
    });
    
    return NextResponse.json({ 
      success: true,
      total: allDocs.length,
      suspicious: suspiciousDocs.length,
      suspiciousDocs: suspiciousDocs.map(doc => ({
        _id: doc._id,
        title: doc.title,
        hasBlockchain: !!doc.blockchain,
        hasTasks: !!doc.tasks,
        hasRequirements: !!doc.requirements,
        hasProject: !!doc.project,
        hasHost: !!doc.host,
        hasPlatform: !!doc.platform
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove suspicious documents
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not connected' });
    }
    
    const amasCollection = db.collection('amas');
    const result = await amasCollection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    
    return NextResponse.json({ 
      success: true,
      deleted: result.deletedCount > 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
