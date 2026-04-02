'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FaCheckCircle, FaTimes, FaClock, FaExternalLinkAlt, FaGamepad, FaSpinner } from 'react-icons/fa';
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

interface P2ETasksProps {
  gameId: string;
  tasks: Task[];
}

export default function P2ETasks({ gameId, tasks }: P2ETasksProps) {
  const { data: session, status } = useSession();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processingTask, setProcessingTask] = useState<string | null>(null);

  // Fetch completed tasks from database
  const fetchCompletedTasks = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/p2e-task-status?gameId=${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setCompletedTasks(new Set(data.completedTaskIds || []));
      }
    } catch (error) {
      console.error('Error fetching P2E task status:', error);
    } finally {
      setLoading(false);
    }
  }, [gameId, status]);

  useEffect(() => {
    fetchCompletedTasks();
  }, [fetchCompletedTasks]);

  const handleToggleTask = async (taskId: string) => {
    if (status !== 'authenticated') {
      return;
    }

    setProcessingTask(taskId);
    const isCompleted = completedTasks.has(taskId);

    try {
      if (isCompleted) {
        // Remove completion
        const res = await fetch(`/api/users/p2e-task-status?gameId=${gameId}&taskId=${taskId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setCompletedTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }
      } else {
        // Mark as completed
        const res = await fetch('/api/users/p2e-task-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, taskId }),
        });
        if (res.ok) {
          setCompletedTasks(prev => {
            const newSet = new Set(prev);
            newSet.add(taskId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Error toggling P2E task:', error);
    } finally {
      setProcessingTask(null);
    }
  };

  if (!tasks || tasks.length === 0) {
    return null;
  }

  if (loading && status === 'authenticated') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center gap-3">
          <FaSpinner className="animate-spin text-orange-500" />
          <span className="text-gray-600 dark:text-gray-400">Loading your task progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaGamepad className="text-2xl text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tasks & Quests ({tasks.length})
        </h2>
      </div>

      {status !== 'authenticated' && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-800 dark:text-orange-300">
            <strong>Sign in to track progress:</strong>{' '}
            <Link href="/auth/signin" className="underline hover:no-underline">
              Sign in
            </Link>{' '}
            to save your task progress to your account.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const isCompleted = completedTasks.has(task._id);
          const isTaskEnded = task.status === 'ended' || (task.endDate && new Date(task.endDate) < new Date());

          return (
            <div
              key={task._id}
              className={`border rounded-lg p-6 transition ${
                isTaskEnded
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 opacity-75'
                  : isCompleted
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  isTaskEnded 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    : isCompleted
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
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
                    {!isTaskEnded && isCompleted && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <FaCheckCircle /> Completed
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
                    <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      💰 Reward: {task.reward}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {task.link && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Go to Task <FaExternalLinkAlt size={12} />
                      </a>
                    )}

                    {!isTaskEnded && status === 'authenticated' && (
                      <button
                        onClick={() => handleToggleTask(task._id)}
                        disabled={processingTask === task._id}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                          processingTask === task._id
                            ? 'bg-gray-400 text-white cursor-wait'
                            : isCompleted
                            ? 'bg-gray-500 text-white hover:bg-gray-600'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {processingTask === task._id ? (
                          <>
                            <FaSpinner className="animate-spin" /> Processing...
                          </>
                        ) : isCompleted ? (
                          <>
                            <FaTimes /> Mark as Incomplete
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> Mark as Completed
                          </>
                        )}
                      </button>
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

      <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <p className="text-sm text-orange-800 dark:text-orange-300">
          <strong>Track your progress:</strong> Mark tasks as completed to keep track of your game quests.
          {status === 'authenticated' 
            ? ' Your progress is saved to your account.'
            : ' Sign in to save your progress to your account.'}
        </p>
      </div>
    </div>
  );
}
