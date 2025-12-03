import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AMA } from '@/models';
import mongoose from 'mongoose';
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

// Helper to find by ID or slug
async function findAMA(idOrSlug: string) {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await AMA.findById(idOrSlug);
    if (byId) return byId;
  }
  return await AMA.findOne({ slug: idOrSlug });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const ama = await findAMA(params.id);
    
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
    
    const existing = await findAMA(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'AMA not found' },
        { status: 404 }
      );
    }
    
    // Auto-calculate status based on date
    if (body.date) {
      body.status = calculateAMAStatus(new Date(body.date));
    }
    
    // Update slug if title changed
    if (body.title && body.title !== existing.title) {
      body.slug = generateUniqueSlug(body.title, existing._id.toString());
    }
    
    const ama = await AMA.findByIdAndUpdate(
      existing._id,
      body,
      { new: true, runValidators: true }
    );
    
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
    
    const existing = await findAMA(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'AMA not found' },
        { status: 404 }
      );
    }
    
    await AMA.findByIdAndDelete(existing._id);
    
    return NextResponse.json({ success: true, data: existing });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
