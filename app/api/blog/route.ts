import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Blog } from '@/models';

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
