import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { User, AMA } from '@/models';

export const runtime = 'nodejs';

// GET task status for an AMA
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const amaId = searchParams.get('amaId');

    if (!amaId) {
      return NextResponse.json(
        { error: 'Missing amaId' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    const ama = await AMA.findById(amaId);

    if (!user || !ama) {
      return NextResponse.json(
        { error: 'User or AMA not found' },
        { status: 404 }
      );
    }

    const isAMAEnded = ama.date && new Date(ama.date) < new Date();

    // Get task statuses
    const taskStatuses = (ama.tasks || []).map((task: any) => {
      const isCompleted = user.completedAMATasks?.some(
        (ct: any) => ct.amaId.toString() === amaId && ct.taskId === task._id.toString()
      );

      let status: 'completed' | 'missed' | 'pending' = 'pending';
      
      if (isCompleted) {
        status = 'completed';
      } else if (isAMAEnded) {
        status = 'missed';
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
    console.error('Error fetching AMA task status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task status' },
      { status: 500 }
    );
  }
}

// POST - Mark task as completed
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amaId, taskId } = await request.json();

    if (!amaId || !taskId) {
      return NextResponse.json(
        { error: 'Missing amaId or taskId' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    const ama = await AMA.findById(amaId);

    if (!user || !ama) {
      return NextResponse.json(
        { error: 'User or AMA not found' },
        { status: 404 }
      );
    }

    // Check if AMA has ended
    const isAMAEnded = ama.date && new Date(ama.date) < new Date();
    if (isAMAEnded) {
      return NextResponse.json(
        { error: 'This AMA has ended' },
        { status: 400 }
      );
    }

    // Check if task exists in AMA
    const taskExists = (ama.tasks || []).some((t: any) => t._id.toString() === taskId);
    if (!taskExists) {
      return NextResponse.json(
        { error: 'Task not found in AMA' },
        { status: 404 }
      );
    }

    // Check if already completed
    const alreadyCompleted = user.completedAMATasks?.some(
      (ct: any) => ct.amaId.toString() === amaId && ct.taskId === taskId
    );

    if (alreadyCompleted) {
      return NextResponse.json(
        { error: 'Task already completed' },
        { status: 400 }
      );
    }

    // Add to completed tasks
    user.completedAMATasks = user.completedAMATasks || [];
    user.completedAMATasks.push({
      amaId,
      taskId,
      completedAt: new Date(),
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Task marked as completed',
    });
  } catch (error: any) {
    console.error('Error marking AMA task as completed:', error);
    return NextResponse.json(
      { error: 'Failed to mark task as completed' },
      { status: 500 }
    );
  }
}

// DELETE - Unmark task as completed
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const amaId = searchParams.get('amaId');
    const taskId = searchParams.get('taskId');

    if (!amaId || !taskId) {
      return NextResponse.json(
        { error: 'Missing amaId or taskId' },
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

    // Remove from completed tasks
    user.completedAMATasks = (user.completedAMATasks || []).filter(
      (ct: any) => !(ct.amaId.toString() === amaId && ct.taskId === taskId)
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Task marked as incomplete',
    });
  } catch (error: any) {
    console.error('Error unmarking AMA task:', error);
    return NextResponse.json(
      { error: 'Failed to unmark task' },
      { status: 500 }
    );
  }
}
