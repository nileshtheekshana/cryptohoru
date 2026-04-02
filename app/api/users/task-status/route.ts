import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { User, Airdrop } from '@/models';

export const runtime = 'nodejs';

// Get user's task statuses for an airdrop
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const airdropId = searchParams.get('airdropId');

    if (!airdropId) {
      return NextResponse.json(
        { success: false, error: 'Airdrop ID required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const airdrop = await Airdrop.findById(airdropId);
    if (!airdrop) {
      return NextResponse.json(
        { success: false, error: 'Airdrop not found' },
        { status: 404 }
      );
    }

    // Calculate status for each task
    const isAirdropEnded = airdrop.endDate && new Date(airdrop.endDate) < new Date();
    const taskStatuses = airdrop.tasks.map((task: any) => {
      const isCompleted = user.completedTasks?.some(
        (ct: any) => ct.airdropId.toString() === airdropId && ct.taskId === task._id.toString()
      );

      let status: 'completed' | 'missed' | 'pending';
      if (isCompleted) {
        status = 'completed';
      } else if (isAirdropEnded) {
        status = 'missed';
      } else {
        status = 'pending';
      }

      return {
        taskId: task._id.toString(),
        status,
      };
    });

    return NextResponse.json({
      success: true,
      data: taskStatuses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Mark task as completed
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { airdropId, taskId } = body;

    if (!airdropId || !taskId) {
      return NextResponse.json(
        { success: false, error: 'Airdrop ID and Task ID required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const airdrop = await Airdrop.findById(airdropId);
    if (!airdrop) {
      return NextResponse.json(
        { success: false, error: 'Airdrop not found' },
        { status: 404 }
      );
    }

    // Check if airdrop has ended
    if (airdrop.endDate && new Date(airdrop.endDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Airdrop has ended' },
        { status: 400 }
      );
    }

    // Check if task already completed
    const alreadyCompleted = user.completedTasks?.some(
      (ct: any) => ct.airdropId.toString() === airdropId && ct.taskId === taskId
    );

    if (alreadyCompleted) {
      return NextResponse.json(
        { success: false, error: 'Task already completed' },
        { status: 400 }
      );
    }

    // Add to completed tasks
    user.completedTasks = user.completedTasks || [];
    user.completedTasks.push({
      airdropId,
      taskId,
      completedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Task marked as completed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Unmark task (remove completion)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const airdropId = searchParams.get('airdropId');
    const taskId = searchParams.get('taskId');

    if (!airdropId || !taskId) {
      return NextResponse.json(
        { success: false, error: 'Airdrop ID and Task ID required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove from completed tasks
    user.completedTasks = user.completedTasks?.filter(
      (ct: any) => !(ct.airdropId.toString() === airdropId && ct.taskId === taskId)
    ) || [];

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Task completion removed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
