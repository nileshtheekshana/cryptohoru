import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Airdrop } from '@/models';
import mongoose from 'mongoose';
import { generateUniqueSlug } from '@/lib/generateSlug';

export const runtime = 'nodejs';

// Helper to find by ID or slug
async function findAirdrop(idOrSlug: string) {
  // Check if it's a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Airdrop.findById(idOrSlug);
    if (byId) return byId;
  }
  // Try to find by slug
  return await Airdrop.findOne({ slug: idOrSlug });
}

// GET single airdrop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const airdrop = await findAirdrop(id);
    
    if (!airdrop) {
      return NextResponse.json(
        { success: false, error: 'Airdrop not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: airdrop });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update airdrop
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    
    // Find the airdrop first
    const existing = await findAirdrop(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Airdrop not found' },
        { status: 404 }
      );
    }
    
    // Update slug if title changed
    if (body.title && body.title !== existing.title) {
      body.slug = generateUniqueSlug(body.title, existing._id.toString());
    }
    
    const airdrop = await Airdrop.findByIdAndUpdate(
      existing._id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: airdrop });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE airdrop
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const existing = await findAirdrop(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Airdrop not found' },
        { status: 404 }
      );
    }
    
    await Airdrop.findByIdAndDelete(existing._id);
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
