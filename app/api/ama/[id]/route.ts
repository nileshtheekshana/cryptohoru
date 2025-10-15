import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AMA } from '@/models';

export const runtime = 'nodejs';

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
