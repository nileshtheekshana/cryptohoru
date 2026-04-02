import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { User, P2EGame } from '@/models';

export const runtime = 'nodejs';

// Get user's task statuses for a P2E game
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
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID required' },
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

    const game = await P2EGame.findById(gameId);
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    // Calculate status for each task
    const taskStatuses = (game.tasks || []).map((task: any) => {
      const isCompleted = user.completedP2ETasks?.some(
        (ct: any) => ct.gameId.toString() === gameId && ct.taskId === task._id.toString()
      );

      const isTaskEnded = task.status === 'ended';

      let status: 'completed' | 'missed' | 'pending';
      if (isCompleted) {
        status = 'completed';
      } else if (isTaskEnded) {
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

// Mark P2E task as completed
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
    const { gameId, taskId } = body;

    if (!gameId || !taskId) {
      return NextResponse.json(
        { success: false, error: 'Game ID and Task ID required' },
        { status: 400 }
      );
    }

    // Verify the game and task exist
    const game = await P2EGame.findById(gameId);
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    const task = game.tasks?.find((t: any) => t._id.toString() === taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task is ended
    if (task.status === 'ended') {
      return NextResponse.json(
        { success: false, error: 'This task has ended' },
        { status: 400 }
      );
    }

    // Add to user's completed tasks
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $addToSet: {
          completedP2ETasks: {
            gameId,
            taskId,
            completedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

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

// Unmark P2E task as completed
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
    const gameId = searchParams.get('gameId');
    const taskId = searchParams.get('taskId');

    if (!gameId || !taskId) {
      return NextResponse.json(
        { success: false, error: 'Game ID and Task ID required' },
        { status: 400 }
      );
    }

    // Remove from user's completed tasks
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $pull: {
          completedP2ETasks: {
            gameId,
            taskId,
          },
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task unmarked as completed',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
