import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { airdropId, taskId } = await request.json();

    if (!airdropId || !taskId) {
      return NextResponse.json(
        { error: 'Missing airdropId or taskId' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if task already completed
    const alreadyCompleted = user.completedTasks?.some(
      (ct: any) => ct.airdropId === airdropId && ct.taskId === taskId
    );

    if (alreadyCompleted) {
      return NextResponse.json(
        { error: 'Task already completed' },
        { status: 400 }
      );
    }

    // Add completed task
    user.completedTasks = user.completedTasks || [];
    user.completedTasks.push({
      airdropId,
      taskId,
      completedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({
      success: true,
      completedTasks: user.completedTasks,
    });
  } catch (error: any) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { airdropId, taskId } = await request.json();

    if (!airdropId || !taskId) {
      return NextResponse.json(
        { error: 'Missing airdropId or taskId' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove completed task
    user.completedTasks = user.completedTasks?.filter(
      (ct: any) => !(ct.airdropId === airdropId && ct.taskId === taskId)
    ) || [];

    await user.save();

    return NextResponse.json({
      success: true,
      completedTasks: user.completedTasks,
    });
  } catch (error: any) {
    console.error('Error removing completed task:', error);
    return NextResponse.json(
      { error: 'Failed to remove completed task' },
      { status: 500 }
    );
  }
}
