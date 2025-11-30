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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      checkFollowStatus();
    }
  }, [session, airdropId]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.followedAirdrops?.includes(airdropId) || false);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!session?.user) return;

    setLoading(true);
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
        alert(data.error || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold opacity-50 cursor-not-allowed"
      >
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
      disabled={loading}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
        isFollowing
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        'Loading...'
      ) : isFollowing ? (
        <>
          <FaHeart /> Unfollow
        </>
      ) : (
        <>
          <FaRegHeart /> Follow Airdrop
        </>
      )}
    </button>
  );
}
