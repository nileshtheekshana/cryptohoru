import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { User } from '@/models';
import mongoose from 'mongoose';

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

    const { airdropId } = await request.json();

    if (!airdropId) {
      return NextResponse.json(
        { error: 'Missing airdropId' },
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

    // Convert to ObjectId for proper comparison
    const airdropObjectId = new mongoose.Types.ObjectId(airdropId);

    // Check if already following (compare as strings)
    const isAlreadyFollowing = user.followedAirdrops?.some(
      (id: any) => id.toString() === airdropObjectId.toString()
    );

    if (isAlreadyFollowing) {
      return NextResponse.json(
        { error: 'Already following this airdrop', isFollowing: true },
        { status: 400 }
      );
    }

    // Add to followed airdrops
    user.followedAirdrops = user.followedAirdrops || [];
    user.followedAirdrops.push(airdropObjectId);

    await user.save();

    return NextResponse.json({
      success: true,
      isFollowing: true,
      followedAirdrops: user.followedAirdrops.map((id: any) => id.toString()),
    });
  } catch (error: any) {
    console.error('Error following airdrop:', error);
    return NextResponse.json(
      { error: 'Failed to follow airdrop' },
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

    const { airdropId } = await request.json();

    if (!airdropId) {
      return NextResponse.json(
        { error: 'Missing airdropId' },
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

    // Remove from followed airdrops (compare as strings)
    user.followedAirdrops = user.followedAirdrops?.filter(
      (id: any) => id.toString() !== airdropId.toString()
    ) || [];

    // Also remove all completed tasks for this airdrop
    user.completedTasks = user.completedTasks?.filter(
      (ct: any) => ct.airdropId?.toString() !== airdropId.toString()
    ) || [];

    await user.save();

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followedAirdrops: user.followedAirdrops.map((id: any) => id.toString()),
    });
  } catch (error: any) {
    console.error('Error unfollowing airdrop:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow airdrop' },
      { status: 500 }
    );
  }
}
