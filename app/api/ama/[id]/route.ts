import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AMA } from '@/models';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const ama = await AMA.findById(params.id);
    
    if (!ama) {
      return NextResponse.json(
        { success: false, error: 'AMA not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: ama });
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
    
    // Auto-calculate status based on date
    if (body.date) {
      body.status = calculateAMAStatus(new Date(body.date));
    }
    
    const ama = await AMA.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!ama) {
      return NextResponse.json(
        { success: false, error: 'AMA not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: ama });
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
    
    const ama = await AMA.findByIdAndDelete(params.id);
    
    if (!ama) {
      return NextResponse.json(
        { success: false, error: 'AMA not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: ama });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
