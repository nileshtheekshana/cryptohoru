import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { News } from '@/models';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

// Helper to find news by ID or slug
async function findNews(idOrSlug: string) {
  // First try to find by ID if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await News.findById(idOrSlug);
    if (byId) return byId;
  }
  // Fall back to slug lookup
  return await News.findOne({ slug: idOrSlug });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const article = await findNews(params.id);
    
    if (!article) {
      return NextResponse.json(
        { success: false, error: 'News article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: article });
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
    
    const existing = await findNews(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'News article not found' },
        { status: 404 }
      );
    }
    
    const article = await News.findByIdAndUpdate(
      existing._id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: article });
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
    
    const existing = await findNews(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'News article not found' },
        { status: 404 }
      );
    }
    
    const article = await News.findByIdAndDelete(existing._id);
    
    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
