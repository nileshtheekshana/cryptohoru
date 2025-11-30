'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaTimes, FaClock, FaTasks, FaCoins, FaTrophy, FaCircle } from 'react-icons/fa';

interface CompletedTask {
  airdropId: string;
  taskId: string;
  completedAt: Date;
}

interface Airdrop {
  _id: string;
  title: string;
  description: string;
  reward: string;
  status: string;
  endDate: string;
  tasks: Array<{
    _id: string;
    title: string;
    description: string;
    type: string;
    reward: string;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [followedAirdrops, setFollowedAirdrops] = useState<Airdrop[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      // Fetch user's data and all active airdrops
      const [userResponse, airdropsResponse] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/airdrops?status=active')
      ]);
      
      const userData = await userResponse.json();
      const airdropsData = await airdropsResponse.json();
      
      if (userData.success) {
        setCompletedTasks(userData.user.completedTasks || []);
        
        // Fetch details of followed airdrops
        if (userData.user.followedAirdrops && userData.user.followedAirdrops.length > 0) {
          const airdropPromises = userData.user.followedAirdrops.map((id: string) =>
            fetch(`/api/airdrops/${id}`).then(res => res.json())
          );
          const airdrops = await Promise.all(airdropPromises);
          setFollowedAirdrops(airdrops.filter(a => a.success).map(a => a.data));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStats = () => {
    let completed = 0;
    let missed = 0;
    let pending = 0;

    followedAirdrops.forEach(airdrop => {
      const isAirdropEnded = airdrop.endDate && new Date(airdrop.endDate) < new Date();
      
      airdrop.tasks.forEach((task: any) => {
        const isCompleted = completedTasks.some(
          ct => ct.airdropId === airdrop._id && ct.taskId === task._id
        );

        if (isCompleted) {
          completed++;
        } else if (isAirdropEnded) {
          missed++;
        } else {
          pending++;
        }
      });
    });

    return { completed, missed, pending };
  };

  const taskStats = getTaskStats();

  const toggleTaskCompletion = async (airdropId: string, taskId: string) => {
    try {
      const isCompleted = completedTasks.some(
        ct => ct.airdropId === airdropId && ct.taskId === taskId
      );

      const response = await fetch('/api/users/complete-task', {
        method: isCompleted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airdropId, taskId }),
      });

      if (response.ok) {
        fetchUserData();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const toggleFollowAirdrop = async (airdropId: string) => {
    try {
      const isFollowing = followedAirdrops.some(a => a._id === airdropId);

      const response = await fetch('/api/users/follow-airdrop', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airdropId }),
      });

      if (response.ok) {
        fetchUserData();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const isTaskCompleted = (airdropId: string, taskId: string) => {
    return completedTasks.some(
      ct => ct.airdropId === airdropId && ct.taskId === taskId
    );
  };

  const getAirdropProgress = (airdrop: Airdrop) => {
    const totalTasks = airdrop.tasks.length;
    const completedCount = airdrop.tasks.filter(task =>
      isTaskCompleted(airdrop._id, task._id)
    ).length;
    return { total: totalTasks, completed: completedCount };
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {session.user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your airdrops and manage your tasks
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {taskStats.completed}
                </p>
              </div>
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {taskStats.pending}
                </p>
              </div>
              <FaClock className="text-4xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Missed</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {taskStats.missed}
                </p>
              </div>
              <FaTimes className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Following</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {followedAirdrops.length}
                </p>
              </div>
              <FaTrophy className="text-4xl text-blue-500" />
            </div>
          </div>
        </div>

        {/* Followed Airdrops */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Airdrops
            </h2>
            <Link
              href="/airdrops"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse Airdrops →
            </Link>
          </div>

          {followedAirdrops.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <FaCoins className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Airdrops Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start following airdrops to track your tasks and earn rewards
              </p>
              <Link
                href="/airdrops"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Explore Airdrops
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {followedAirdrops.map((airdrop) => {
                const progress = getAirdropProgress(airdrop);
                const progressPercentage = progress.total > 0 
                  ? (progress.completed / progress.total) * 100 
                  : 0;

                return (
                  <div
                    key={airdrop._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {airdrop.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {airdrop.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            💰 {airdrop.reward}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              airdrop.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {airdrop.status}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleFollowAirdrop(airdrop._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Unfollow
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress: {progress.completed} / {progress.total} tasks
                        </span>
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Tasks:</h4>
                      {airdrop.tasks.map((task) => {
                        const completed = isTaskCompleted(airdrop._id, task._id);
                        return (
                          <div
                            key={task._id}
                            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition cursor-pointer ${
                              completed
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                            }`}
                            onClick={() => toggleTaskCompletion(airdrop._id, task._id)}
                          >
                            {completed ? (
                              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-1" />
                            ) : (
                              <FaCircle className="text-gray-400 text-xl flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {task.title}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                  {task.type}
                                </span>
                                {task.reward && (
                                  <span className="text-green-600 dark:text-green-400 font-semibold">
                                    +{task.reward}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
