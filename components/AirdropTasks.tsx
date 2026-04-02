'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCheckCircle, FaTimes, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';

interface Task {
  _id: string;
  title: string;
  description: string;
  type: string;
  reward?: string;
  link?: string;
  status?: 'ongoing' | 'ended';
  endDate?: string;
}

interface TaskStatus {
  taskId: string;
  status: 'completed' | 'missed' | 'pending';
}

interface AirdropTasksProps {
  airdropId: string;
  tasks: Task[];
  isAirdropEnded: boolean;
}

export default function AirdropTasks({ airdropId, tasks, isAirdropEnded }: AirdropTasksProps) {
  const { data: session, status } = useSession();
  const [taskStatuses, setTaskStatuses] = useState<Record<string, 'completed' | 'missed' | 'pending'>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTaskStatuses();
    } else {
      setLoading(false);
    }
  }, [status, airdropId]);

  const fetchTaskStatuses = async () => {
    try {
      const res = await fetch(`/api/users/task-status?airdropId=${airdropId}`);
      if (res.ok) {
        const data = await res.json();
        const statusMap: Record<string, 'completed' | 'missed' | 'pending'> = {};
        data.data.forEach((ts: TaskStatus) => {
          statusMap[ts.taskId] = ts.status;
        });
        setTaskStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error fetching task statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (!session) {
      alert('Please sign in to track your progress');
      return;
    }

    if (isAirdropEnded) {
      alert('This airdrop has ended');
      return;
    }

    setProcessing(taskId);

    try {
      if (currentStatus === 'completed') {
        // Unmark as completed
        const res = await fetch(`/api/users/task-status?airdropId=${airdropId}&taskId=${taskId}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          setTaskStatuses(prev => ({ ...prev, [taskId]: 'pending' }));
        } else {
          alert('Failed to update task status');
        }
      } else {
        // Mark as completed
        const res = await fetch('/api/users/task-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ airdropId, taskId }),
        });
        
        if (res.ok) {
          setTaskStatuses(prev => ({ ...prev, [taskId]: 'completed' }));
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to update task status');
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('An error occurred');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: 'completed' | 'missed' | 'pending') => {
    switch (status) {
      case 'completed':
        return {
          icon: <FaCheckCircle />,
          label: 'Completed',
          class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        };
      case 'missed':
        return {
          icon: <FaTimes />,
          label: 'Missed',
          class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        };
      case 'pending':
        return {
          icon: <FaClock />,
          label: 'Pending',
          class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tasks to Complete ({tasks.length})
        </h2>
        {!session && (
          <Link
            href="/auth/signin"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign in to track progress
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const userStatus = taskStatuses[task._id] || 'pending';
          const statusBadge = getStatusBadge(userStatus);
          const isProcessing = processing === task._id;
          const isTaskEnded = task.status === 'ended' || (task.endDate && new Date(task.endDate) < new Date());

          return (
            <div
              key={task._id}
              className={`border rounded-lg p-6 transition ${
                isTaskEnded
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 opacity-75'
                  : userStatus === 'completed'
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : userStatus === 'missed'
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  isTaskEnded 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-lg font-semibold ${
                        isTaskEnded 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      {/* Task Status Badge */}
                      {isTaskEnded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          <FaTimes size={10} /> Ended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <FaClock size={10} /> Ongoing
                        </span>
                      )}
                    </div>
                    {session && !isTaskEnded && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.class}`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </span>
                    )}
                  </div>

                  <p className={`mb-3 ${
                    isTaskEnded 
                      ? 'text-gray-400 dark:text-gray-500' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {task.description}
                  </p>

                  {task.reward && (
                    <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      💰 Reward: {task.reward}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {task.link && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Go to Task <FaExternalLinkAlt size={12} />
                      </a>
                    )}

                    {/* Show button for all users, but with different behavior */}
                    {userStatus !== 'missed' && !isTaskEnded && (
                      session ? (
                        <button
                          onClick={() => handleToggleTask(task._id, userStatus)}
                          disabled={isProcessing || isAirdropEnded}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                            userStatus === 'completed'
                              ? 'bg-gray-500 text-white hover:bg-gray-600'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isProcessing ? (
                            'Updating...'
                          ) : userStatus === 'completed' ? (
                            <>
                              <FaTimes /> Mark as Incomplete
                            </>
                          ) : (
                            <>
                              <FaCheckCircle /> Mark as Completed
                            </>
                          )}
                        </button>
                      ) : (
                        <Link
                          href="/auth/signin"
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        >
                          <FaCheckCircle /> Sign in to Track Progress
                        </Link>
                      )
                    )}
                    
                    {isTaskEnded && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                        This task has ended
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {session && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Track your progress:</strong> Mark tasks as completed to keep track of your participation.
            {isAirdropEnded && ' This airdrop has ended, and uncompleted tasks are marked as missed.'}
          </p>
        </div>
      )}
    </div>
  );
}
