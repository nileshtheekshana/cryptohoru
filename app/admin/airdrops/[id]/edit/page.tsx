'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function EditAirdropPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [airdrop, setAirdrop] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    image: '',
    projectName: '',
    totalReward: '',
    endDate: '',
    requirements: [] as string[],
  });
  const [editTaskData, setEditTaskData] = useState({
    title: '',
    description: '',
    type: 'social',
    reward: '',
    link: '',
    status: 'ongoing',
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'social',
    reward: '',
    link: '',
    status: 'ongoing',
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
        setEditData({
          title: data.data.title,
          description: data.data.description,
          image: data.data.image,
          projectName: data.data.projectName,
          totalReward: data.data.totalReward,
          endDate: data.data.endDate ? new Date(data.data.endDate).toISOString().split('T')[0] : '',
          requirements: data.data.requirements || [],
        });
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
          status: 'ongoing',
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
        setEditMode(false);
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

  const handleSaveAirdropDetails = async () => {
    if (!editData.title || !editData.description) {
      alert('Title and description are required');
      return;
    }

    await handleUpdateAirdrop({
      title: editData.title,
      description: editData.description,
      image: editData.image,
      projectName: editData.projectName,
      totalReward: editData.totalReward,
      endDate: editData.endDate,
      requirements: editData.requirements,
    });
  };

  const handleEditTask = async (taskIndex: number) => {
    if (!editTaskData.title || !editTaskData.description) {
      alert('Task title and description are required');
      return;
    }

    setSaving(true);
    try {
      const updatedTasks = [...airdrop.tasks];
      updatedTasks[taskIndex] = editTaskData;
      
      const res = await fetch(`/api/airdrops/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updatedTasks }),
      });

      if (res.ok) {
        alert('Task updated successfully!');
        fetchAirdrop();
        setEditingTaskIndex(null);
      } else {
        alert('Failed to update task');
      }
    } catch (error) {
      alert('Error updating task');
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
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {!editMode ? (
                <>
                  <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                    {airdrop.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{airdrop.description}</p>
                  {airdrop.image && (
                    <img src={airdrop.image} alt={airdrop.title} className="w-full max-w-md rounded-lg mb-4" />
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Project Name</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{airdrop.projectName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Reward</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{airdrop.totalReward || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {airdrop.endDate ? new Date(airdrop.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {airdrop.requirements && airdrop.requirements.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Requirements</p>
                      <ul className="list-disc list-inside space-y-1">
                        {airdrop.requirements.map((req: string, idx: number) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title *</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description *</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Image URL</label>
                    <input
                      type="text"
                      value={editData.image}
                      onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Project Name</label>
                      <input
                        type="text"
                        value={editData.projectName}
                        onChange={(e) => setEditData({ ...editData, projectName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Total Reward</label>
                      <input
                        type="text"
                        value={editData.totalReward}
                        onChange={(e) => setEditData({ ...editData, totalReward: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">End Date</label>
                    <input
                      type="date"
                      value={editData.endDate}
                      onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Requirements (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editData.requirements.join(', ')}
                      onChange={(e) => setEditData({ ...editData, requirements: e.target.value.split(',').map(r => r.trim()) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Requirement 1, Requirement 2, Requirement 3"
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (editMode) {
                  handleSaveAirdropDetails();
                } else {
                  setEditMode(true);
                }
              }}
              disabled={saving}
              className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {editMode ? (saving ? 'Saving...' : 'Save Details') : 'Edit Details'}
            </button>
            {editMode && (
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditData({
                    title: airdrop.title,
                    description: airdrop.description,
                    image: airdrop.image,
                    projectName: airdrop.projectName,
                    totalReward: airdrop.totalReward,
                    endDate: airdrop.endDate ? new Date(airdrop.endDate).toISOString().split('T')[0] : '',
                    requirements: airdrop.requirements || [],
                  });
                }}
                className="ml-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          
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
                  {editingTaskIndex === index ? (
                    // Edit mode for this task
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm font-semibold">
                          Editing Task #{index + 1}
                        </span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title *</label>
                        <input
                          type="text"
                          value={editTaskData.title}
                          onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description *</label>
                        <textarea
                          value={editTaskData.description}
                          onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
                          <select
                            value={editTaskData.type}
                            onChange={(e) => setEditTaskData({ ...editTaskData, type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          >
                            <option value="social">Social</option>
                            <option value="onchain">On-chain</option>
                            <option value="quiz">Quiz</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                          <select
                            value={editTaskData.status}
                            onChange={(e) => setEditTaskData({ ...editTaskData, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          >
                            <option value="ongoing">Ongoing</option>
                            <option value="ended">Ended</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reward</label>
                          <input
                            type="text"
                            value={editTaskData.reward}
                            onChange={(e) => setEditTaskData({ ...editTaskData, reward: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 100 tokens"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Link</label>
                        <input
                          type="url"
                          value={editTaskData.link}
                          onChange={(e) => setEditTaskData({ ...editTaskData, link: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="https://..."
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTask(index)}
                          disabled={saving}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          {saving ? 'Saving...' : 'Save Task'}
                        </button>
                        <button
                          onClick={() => setEditingTaskIndex(null)}
                          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode for this task
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm font-semibold">
                            Task #{index + 1}
                          </span>
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm">
                            {task.type}
                          </span>
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            task.status === 'ended' 
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                          }`}>
                            {task.status === 'ended' ? '🔴 Ended' : '🟢 Ongoing'}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTaskIndex(index);
                            setEditTaskData({
                              title: task.title,
                              description: task.description,
                              type: task.type,
                              reward: task.reward || '',
                              link: task.link || '',
                              status: task.status || 'ongoing',
                            });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(index)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  )}
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

            <div className="grid md:grid-cols-3 gap-6">
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
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="ended">Ended</option>
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
