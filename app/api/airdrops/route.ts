import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Airdrop } from '@/models';
import { generateUniqueSlug } from '@/lib/generateSlug';
import { sendNewContentToChannel, generateAirdropPost } from '@/lib/telegram';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeHidden = searchParams.get('includeHidden') === 'true';
    
    let filter: any = {};
    if (status) {
      filter.status = status;
    } else if (!includeHidden) {
      // Exclude hidden items from public listing
      filter.status = { $ne: 'hidden' };
    }
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
    
    // Clean up tasks - remove any empty or invalid tasks
    if (body.tasks && Array.isArray(body.tasks)) {
      body.tasks = body.tasks.filter((task: any) => task.title && task.title.trim() !== '');
    }
    
    // Create airdrop first to get the ID
    const airdrop = await Airdrop.create(body);
    
    // Generate and save slug using title and ID
    const slug = generateUniqueSlug(body.title, airdrop._id.toString());
    airdrop.slug = slug;
    await airdrop.save();
    
    // Send Telegram notification to channel
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://cryptohoru.com';
      const message = generateAirdropPost(airdrop.toObject(), baseUrl);
      await sendNewContentToChannel(message);
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      // Don't fail the request if Telegram fails
    }
    
    return NextResponse.json(
      { success: true, data: airdrop },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating airdrop:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
