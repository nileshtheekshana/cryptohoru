import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { P2EGame } from '@/models';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const game = await P2EGame.findById(params.id);
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'P2E game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: game });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
