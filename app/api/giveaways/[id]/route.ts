import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Giveaway } from '@/models';
import mongoose from 'mongoose';
import { generateUniqueSlug } from '@/lib/generateSlug';

export const runtime = 'nodejs';

// Helper to find by ID or slug
async function findGiveaway(idOrSlug: string) {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Giveaway.findById(idOrSlug);
    if (byId) return byId;
  }
  return await Giveaway.findOne({ slug: idOrSlug });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const giveaway = await findGiveaway(params.id);
    
    if (!giveaway) {
      return NextResponse.json(
        { success: false, error: 'Giveaway not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: giveaway });
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
    
    const existing = await findGiveaway(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Giveaway not found' },
        { status: 404 }
      );
    }
    
    // Update slug if title changed
    if (body.title && body.title !== existing.title) {
      body.slug = generateUniqueSlug(body.title, existing._id.toString());
    }
    
    const giveaway = await Giveaway.findByIdAndUpdate(
      existing._id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: giveaway });
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
    
    const existing = await findGiveaway(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Giveaway not found' },
        { status: 404 }
      );
    }
    
    await Giveaway.findByIdAndDelete(existing._id);
    
    return NextResponse.json({ success: true, data: existing });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
