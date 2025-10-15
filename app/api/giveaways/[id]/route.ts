import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Giveaway } from '@/models';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const giveaway = await Giveaway.findById(params.id);
    
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
