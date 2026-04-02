import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';

export const runtime = 'nodejs';

// Get user's timezone
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('timezone');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      timezone: user.timezone || 'Asia/Kolkata',
    });
  } catch (error: any) {
    console.error('Error fetching timezone:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timezone' },
      { status: 500 }
    );
  }
}

// Update user's timezone
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { timezone } = await request.json();

    if (!timezone) {
      return NextResponse.json(
        { error: 'Missing timezone' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { timezone, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      timezone: user.timezone,
    });
  } catch (error: any) {
    console.error('Error updating timezone:', error);
    return NextResponse.json(
      { error: 'Failed to update timezone' },
      { status: 500 }
    );
  }
}
