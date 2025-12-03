import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { P2EGame } from '@/models';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

// Helper to find P2E game by ID or slug
async function findP2EGame(idOrSlug: string) {
  // First try to find by ID if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await P2EGame.findById(idOrSlug);
    if (byId) return byId;
  }
  // Fall back to slug lookup
  return await P2EGame.findOne({ slug: idOrSlug });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const game = await findP2EGame(params.id);
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'P2E game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: game });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    const existing = await findP2EGame(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'P2E game not found' },
        { status: 404 }
      );
    }
    
    const game = await P2EGame.findByIdAndUpdate(
      existing._id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: game });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const existing = await findP2EGame(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'P2E game not found' },
        { status: 404 }
      );
    }
    
    const game = await P2EGame.findByIdAndDelete(existing._id);
    
    return NextResponse.json({ success: true, data: game });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
