import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Airdrop } from '@/models';

export const runtime = 'nodejs';

// POST add task to airdrop
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const task = await request.json();
    
    const airdrop = await Airdrop.findById(params.id);
    if (!airdrop) {
      return NextResponse.json(
        { success: false, error: 'Airdrop not found' },
        { status: 404 }
      );
    }
    
    airdrop.tasks.push(task);
    airdrop.updatedAt = new Date();
    await airdrop.save();
    
    return NextResponse.json(
      { success: true, data: airdrop },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { taskId, ...taskData } = await request.json();
    
    const airdrop = await Airdrop.findOneAndUpdate(
      { _id: params.id, 'tasks._id': taskId },
      { $set: { 'tasks.$': { ...taskData, _id: taskId } } },
      { new: true }
    );
    
    if (!airdrop) {
      return NextResponse.json(
        { success: false, error: 'Airdrop or task not found' },
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

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    const airdrop = await Airdrop.findByIdAndUpdate(
      params.id,
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
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
      { status: 500 }
    );
  }
}
