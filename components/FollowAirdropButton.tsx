'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface FollowAirdropButtonProps {
  airdropId: string;
}

export default function FollowAirdropButton({ airdropId }: FollowAirdropButtonProps) {
  const { data: session, status } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user?.email) {
      checkFollowStatus();
    } else {
      setLoading(false);
    }
  }, [session, status, airdropId]);

  const checkFollowStatus = async () => {
    setLoading(true);
    try {
      // Add timestamp to prevent caching
      const response = await fetch(`/api/users/me?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        // API returns { success: true, user: { followedAirdrops: [...] } }
        const followedAirdrops = data.user?.followedAirdrops || [];
        const airdropIdStr = airdropId.toString();
        const isCurrentlyFollowing = followedAirdrops.some(
          (id: string) => id.toString() === airdropIdStr
        );
        setIsFollowing(isCurrentlyFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session?.user) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/users/follow-airdrop', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airdropId }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const data = await response.json();
        // If already following, just update the state
        if (data.error === 'Already following this airdrop') {
          setIsFollowing(true);
        } else {
          alert(data.error || 'Failed to update follow status');
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setActionLoading(false);
    }
  };

  // Show loading state while checking auth or follow status
  if (status === 'loading' || loading) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
      >
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        Loading...
      </button>
    );
  }

  // Show sign-in button for unauthenticated users
  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center transition flex items-center justify-center gap-2"
      >
        <FaRegHeart />
        Sign in to Follow
      </Link>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={actionLoading}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
        isFollowing
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {actionLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      ) : isFollowing ? (
        <>
          <FaHeart className="text-pink-200" /> Unfollow Airdrop
        </>
      ) : (
        <>
          <FaRegHeart /> Follow Airdrop
        </>
      )}
    </button>
  );
}
