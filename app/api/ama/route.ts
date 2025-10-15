import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AMA } from '@/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const filter = status ? { status } : {};
    const amas = await AMA.find(filter).sort({ date: -1 });
    
    return NextResponse.json({ success: true, data: amas });
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
    const ama = await AMA.create(body);
    
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
