import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AMA } from '@/models';
import { generateUniqueSlug } from '@/lib/generateSlug';

export const runtime = 'nodejs';

// Helper function to determine AMA status based on date
function calculateAMAStatus(amaDate: Date): string {
  const now = new Date();
  const amaDateTime = new Date(amaDate);
  
  // AMA is live for 2 hours starting from the scheduled time
  const amaEndTime = new Date(amaDateTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours after start
  
  const nowTime = now.getTime();
  const amaStartTime = amaDateTime.getTime();
  const amaEnd = amaEndTime.getTime();
  
  if (nowTime >= amaStartTime && nowTime <= amaEnd) {
    return 'live';
  } else if (nowTime < amaStartTime) {
    return 'upcoming';
  } else {
    return 'completed';
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Get all AMAs
    const now = new Date();
    const nowTime = now.getTime();
    const allAMAs = await AMA.find({});
    
    // Update statuses directly and save individually (ensures immediate consistency)
    for (const ama of allAMAs) {
      try {
        // Skip AMAs with empty or invalid dates
        if (!ama.date) continue;
        
        const amaDateTime = new Date(ama.date);
        if (isNaN(amaDateTime.getTime())) continue;
        
        const amaStartTime = amaDateTime.getTime();
        const amaEndTime = amaStartTime + (2 * 60 * 60 * 1000);
        
        let newStatus: 'live' | 'upcoming' | 'completed';
        
        if (nowTime >= amaStartTime && nowTime <= amaEndTime) {
          newStatus = 'live';
        } else if (nowTime < amaStartTime) {
          newStatus = 'upcoming';
        } else {
          newStatus = 'completed';
        }
      
        // Update in memory for immediate response
        if (ama.status !== newStatus) {
          ama.status = newStatus;
          // Don't save - just update in memory for response
        }
      } catch (error) {
        continue;
      }
    }
    
    // Filter by status if requested
    let filteredAMAs = allAMAs;
    if (statusFilter) {
      filteredAMAs = allAMAs.filter(ama => ama.status === statusFilter);
    }
    
    // Custom sort: Live first, then Upcoming (earliest first), then Ended (latest first)
    const sortedAMAs = filteredAMAs.sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, completed: 2 };
      const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      
      if (statusDiff !== 0) return statusDiff;
      
      // Within same status, sort by date
      if (a.status === 'upcoming') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
    
    // Get total count
    const total = sortedAMAs.length;
    
    // Apply pagination
    const paginatedAMAs = sortedAMAs.slice(skip, skip + limit);
    
    return NextResponse.json({ 
      success: true, 
      data: paginatedAMAs,
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
    
    // Auto-calculate status based on date
    if (body.date) {
      body.status = calculateAMAStatus(new Date(body.date));
    }
    
    const ama = await AMA.create(body);
    
    // Generate and save slug
    const slug = generateUniqueSlug(body.title, ama._id.toString());
    ama.slug = slug;
    await ama.save();
    
    return NextResponse.json(
      { success: true, data: ama },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
