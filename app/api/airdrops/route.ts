import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Airdrop } from '@/models';
import { generateUniqueSlug } from '@/lib/generateSlug';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const filter = status ? { status } : {};
    const airdrops = await Airdrop.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: airdrops });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST new airdrop
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create airdrop first to get the ID
    const airdrop = await Airdrop.create(body);
    
    // Generate and save slug using title and ID
    const slug = generateUniqueSlug(body.title, airdrop._id.toString());
    airdrop.slug = slug;
    await airdrop.save();
    
    return NextResponse.json(
      { success: true, data: airdrop },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
