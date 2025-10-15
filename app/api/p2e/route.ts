import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { P2EGame } from '@/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const filter = status ? { status } : {};
    const games = await P2EGame.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: games });
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
    const game = await P2EGame.create(body);
    
    return NextResponse.json(
      { success: true, data: game },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
