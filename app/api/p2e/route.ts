import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { P2EGame } from '@/models';
import { generateUniqueSlug } from '@/lib/generateSlug';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const filter = status ? { status } : {};
    const games = await P2EGame.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: games });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Generate a temporary ID for slug generation
    const tempId = new mongoose.Types.ObjectId();
    
    // Generate SEO-friendly slug from name
    if (!body.slug && body.name) {
      body.slug = generateUniqueSlug(body.name, tempId.toString());
    }
    
    // Create with the pre-generated ID
    body._id = tempId;
    const game = await P2EGame.create(body);
    
    return NextResponse.json(
      { success: true, data: game },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
