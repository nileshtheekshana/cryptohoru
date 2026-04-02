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
}

interface TaskStatus {
  taskId: string;
  status: 'completed' | 'missed' | 'pending';
}

interface AMATasksProps {
  amaId: string;
  tasks: Task[];
  isAMAEnded: boolean;
}

export default function AMATasks({ amaId, tasks, isAMAEnded }: AMATasksProps) {
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
  }, [status, amaId]);

  const fetchTaskStatuses = async () => {
    try {
      const res = await fetch(`/api/users/ama-task-status?amaId=${amaId}`);
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

    if (isAMAEnded) {
      alert('This AMA has ended');
      return;
    }

    setProcessing(taskId);

    try {
      if (currentStatus === 'completed') {
        // Unmark as completed
        const res = await fetch(`/api/users/ama-task-status?amaId=${amaId}&taskId=${taskId}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          setTaskStatuses(prev => ({ ...prev, [taskId]: 'pending' }));
        } else {
          alert('Failed to update task status');
        }
      } else {
        // Mark as completed
        const res = await fetch('/api/users/ama-task-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amaId, taskId }),
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

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pre-AMA Tasks ({tasks.length})
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
        {tasks.filter(task => task && task._id && task.title).map((task, index) => {
          const status = taskStatuses[task._id] || 'pending';
          const statusBadge = getStatusBadge(status);
          const isProcessing = processing === task._id;

          return (
            <div
              key={task._id || `task-${index}`}
              className={`border rounded-lg p-6 transition ${
                status === 'completed'
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : status === 'missed'
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    {session && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.class}`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {task.description}
                  </p>

                  {task.reward && (
                    <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      💰 Reward: {task.reward}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {task.link && typeof task.link === 'string' && task.link.trim() && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                      >
                        Go to Task <FaExternalLinkAlt size={12} />
                      </a>
                    )}

                    {session ? (
                      status === 'completed' ? (
                        <button
                          onClick={() => handleToggleTask(task._id, status)}
                          disabled={isProcessing || isAMAEnded}
                          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Updating...' : 'Mark Incomplete'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleTask(task._id, status)}
                          disabled={isProcessing || isAMAEnded}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Updating...' : 'Mark as Complete'}
                        </button>
                      )
                    ) : (
                      <Link
                        href="/auth/signin"
                        className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                      >
                        Sign in to Track
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
