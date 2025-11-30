import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Giveaway } from '@/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;
    
    const now = new Date();
    let filter: any = {};
    
    // Calculate status based on endDate
    if (statusParam === 'live') {
      // Live: endDate is in the future (within next 7 days or less)
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filter = {
        endDate: { $gte: now, $lte: sevenDaysFromNow }
      };
    } else if (statusParam === 'upcoming') {
      // Upcoming: endDate is more than 7 days in the future
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      filter = {
        endDate: { $gt: sevenDaysFromNow }
      };
    } else if (statusParam === 'ended') {
      // Ended: endDate has passed
      filter = {
        endDate: { $lt: now }
      };
    }
    
    const total = await Giveaway.countDocuments(filter);
    const giveaways = await Giveaway.find(filter)
      .sort({ endDate: statusParam === 'ended' ? -1 : 1 })
      .skip(skip)
      .limit(limit);
    
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
