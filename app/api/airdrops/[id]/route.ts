import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Airdrop } from '@/models';

export const runtime = 'nodejs';

// GET single airdrop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const airdrop = await Airdrop.findById(id);
    
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
    
    const airdrop = await Airdrop.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
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
    const airdrop = await Airdrop.findByIdAndDelete(id);
    
    if (!airdrop) {
      return NextResponse.json(
        { success: false, error: 'Airdrop not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
