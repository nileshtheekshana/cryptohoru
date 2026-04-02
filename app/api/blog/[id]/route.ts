import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Blog } from '@/models';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

// Helper to find blog by ID or slug
async function findBlog(idOrSlug: string) {
  // First try to find by ID if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Blog.findById(idOrSlug);
    if (byId) return byId;
  }
  // Fall back to slug lookup
  return await Blog.findOne({ slug: idOrSlug });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const post = await findBlog(params.id);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: post });
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
    
    const existing = await findBlog(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    const post = await Blog.findByIdAndUpdate(
      existing._id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: post });
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
    
    const existing = await findBlog(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    const post = await Blog.findByIdAndDelete(existing._id);
    
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
