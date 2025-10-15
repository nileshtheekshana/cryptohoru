'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';

export default function EditAirdropPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [airdrop, setAirdrop] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'social',
    reward: '',
    link: '',
  });

  useEffect(() => {
    fetchAirdrop();
  }, []);

  const fetchAirdrop = async () => {
    try {
      const res = await fetch(`/api/airdrops/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setAirdrop(data.data);
      } else {
        alert('Failed to load airdrop');
        router.push('/admin');
      }
    } catch (error) {
      console.error(error);
      alert('Error loading airdrop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.description) {
      alert('Please fill in task title and description');
      return;
    }

    setSaving(true);
    try {
      const updatedTasks = [...(airdrop.tasks || []), newTask];
      const res = await fetch(`/api/airdrops/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updatedTasks }),
      });

      if (res.ok) {
        alert('Task added successfully!');
        fetchAirdrop();
        setNewTask({
          title: '',
          description: '',
          type: 'social',
          reward: '',
          link: '',
        });
      } else {
        alert('Failed to add task');
      }
    } catch (error) {
      alert('Error adding task');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskIndex: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setSaving(true);
    try {
      const updatedTasks = airdrop.tasks.filter((_: any, index: number) => index !== taskIndex);
      const res = await fetch(`/api/airdrops/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updatedTasks }),
      });

      if (res.ok) {
        alert('Task deleted successfully!');
        fetchAirdrop();
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      alert('Error deleting task');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAirdrop = async (updates: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/airdrops/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        alert('Airdrop updated successfully!');
        fetchAirdrop();
      } else {
        alert('Failed to update airdrop');
      }
    } catch (error) {
      alert('Error updating airdrop');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!airdrop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">Airdrop not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <FaArrowLeft /> Back to Admin
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
            {airdrop.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{airdrop.description}</p>
          
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              airdrop.status === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : airdrop.status === 'upcoming'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
            </span>
            
            <select
              value={airdrop.status}
              onChange={(e) => handleUpdateAirdrop({ status: e.target.value })}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {/* Existing Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Existing Tasks ({airdrop.tasks?.length || 0})
          </h2>

          {airdrop.tasks && airdrop.tasks.length > 0 ? (
            <div className="space-y-4">
              {airdrop.tasks.map((task: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm font-semibold">
                          Task #{index + 1}
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm">
                          {task.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {task.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {task.description}
                      </p>
                      {task.reward && (
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                          💰 Reward: {task.reward}
                        </p>
                      )}
                      {task.link && (
                        <a
                          href={task.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          🔗 {task.link}
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(index)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No tasks yet. Add your first task below.
            </p>
          )}
        </div>

        {/* Add New Task Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Add New Task
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Follow on Twitter"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Task Description *
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe what users need to do..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Task Type
                </label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="social">Social Media</option>
                  <option value="transaction">Transaction</option>
                  <option value="verification">Verification</option>
                  <option value="quiz">Quiz</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reward (optional)
                </label>
                <input
                  type="text"
                  value={newTask.reward}
                  onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 10 tokens"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Task Link (optional)
              </label>
              <input
                type="url"
                value={newTask.link}
                onChange={(e) => setNewTask({ ...newTask, link: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddTask}
                disabled={saving || !newTask.title || !newTask.description}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                <FaPlus /> {saving ? 'Adding...' : 'Add Task'}
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Done
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
