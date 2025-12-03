import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Blog } from '@/models';
import { generateUniqueSlug } from '@/lib/generateSlug';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const filter = category ? { category } : {};
    const posts = await Blog.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: posts });
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
    
    // Generate a temporary ID for slug generation
    const tempId = new mongoose.Types.ObjectId();
    
    // Generate SEO-friendly slug from title
    if (!body.slug && body.title) {
      body.slug = generateUniqueSlug(body.title, tempId.toString());
    }
    
    // Process tags if it's a string
    if (typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }
    
    // Create with the pre-generated ID
    body._id = tempId;
    const post = await Blog.create(body);
    
    return NextResponse.json(
      { success: true, data: post },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
