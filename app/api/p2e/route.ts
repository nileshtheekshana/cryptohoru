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
    const includeHidden = searchParams.get('includeHidden') === 'true';
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    
    let filter: any = {};
    if (status) {
      filter.status = status;
    } else if (!includeHidden) {
      // Exclude hidden items from public listing
      filter.status = { $ne: 'hidden' };
    }
    
    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }
    if (tag) {
      filter.tags = tag;
    }
    
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
    
    // Create game first to get the ID
    const game = await P2EGame.create(body);
    
    // Generate and save slug using title and ID
    const slug = generateUniqueSlug(body.title, game._id.toString());
    game.slug = slug;
    await game.save();
    
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
