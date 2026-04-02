import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Giveaway } from '@/models';
import { generateUniqueSlug } from '@/lib/generateSlug';
import { sendNewContentToChannel, generateGiveawayPost } from '@/lib/telegram';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const includeHidden = searchParams.get('includeHidden') === 'true';
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;
    
    const now = new Date();
    let filter: any = {};
    
    // Exclude hidden items from public listing
    if (!includeHidden) {
      filter.status = { $ne: 'hidden' };
    }

    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }
    if (tag) {
      filter.tags = tag;
    }
    
    // Get all giveaways and calculate status
    const allGiveaways = await Giveaway.find(filter);
    
    // Update status dynamically: only auto-set to 'ended' if past endDate
    const updatedGiveaways = allGiveaways.map(giveaway => {
      const giveawayObj = giveaway.toObject();
      const endDate = new Date(giveawayObj.endDate);
      
      // Only auto-calculate 'ended' status
      if (endDate < now && giveawayObj.status !== 'hidden') {
        giveawayObj.status = 'ended';
      }
      
      return giveawayObj;
    });
    
    // Filter by status if requested
    let filteredGiveaways = updatedGiveaways;
    if (statusParam === 'live') {
      filteredGiveaways = updatedGiveaways.filter(g => g.status === 'active' || g.status === 'live');
    } else if (statusParam === 'upcoming') {
      filteredGiveaways = updatedGiveaways.filter(g => g.status === 'upcoming');
    } else if (statusParam === 'ended') {
      filteredGiveaways = updatedGiveaways.filter(g => g.status === 'ended');
    }
    
    // Sort filtered giveaways
    const sortedGiveaways = includeHidden
      ? filteredGiveaways.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : filteredGiveaways.sort((a, b) => {
          if (statusParam === 'ended') {
            return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
          }
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });
    
    const total = sortedGiveaways.length;
    const giveaways = sortedGiveaways.slice(skip, skip + limit);
    
    return NextResponse.json({ 
      success: true, 
      data: giveaways,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
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
    const giveaway = await Giveaway.create(body);
    
    // Generate and save slug
    const slug = generateUniqueSlug(body.title, giveaway._id.toString());
    giveaway.slug = slug;
    await giveaway.save();
    
    // Send Telegram notification to channel
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://cryptohoru.com';
      const message = generateGiveawayPost(giveaway.toObject(), baseUrl);
      await sendNewContentToChannel(message);
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      // Don't fail the request if Telegram fails
    }
    
    return NextResponse.json(
      { success: true, data: giveaway },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
