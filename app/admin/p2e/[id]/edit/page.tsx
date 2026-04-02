"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash } from 'react-icons/fa';

interface Task {
  _id?: string;
  title: string;
  description: string;
  type: string;
  reward: string;
  link: string;
  status: string;
  order: number;
}

interface P2EGame {
  _id: string;
  title: string;
  description: string;
  gameType?: string;
  blockchain?: string;
  tokenSymbol?: string;
  earnings?: string;
  playLink?: string;
  websiteUrl?: string;
  image?: string;
  status: string;
  cost?: string;
  tasks?: Task[];
}

export default function EditP2EPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [game, setGame] = useState<P2EGame | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gameType: "",
    blockchain: "",
    tokenSymbol: "",
    earnings: "",
    playLink: "",
    websiteUrl: "",
    image: "",
    status: "active",
    tags: "",
    costTag: "",
    cost: "Free",
  });

  useEffect(() => {
    fetchGame();
  }, [resolvedParams.id]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/p2e/${resolvedParams.id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch game");
      const result = await response.json();
      const data = result.data || result;
      setGame(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        gameType: data.gameType || "",
        blockchain: data.blockchain || "",
        tokenSymbol: data.tokenSymbol || "",
        earnings: data.earnings || "",
        playLink: data.playLink || "",
        websiteUrl: data.websiteUrl || "",
        image: data.image || data.imageUrl || "",
        status: data.status || "active",
        tags: (data.tags || []).filter((t:string) => !['Free', 'Free/Paid', 'Paid'].includes(t)).join(', '),
        costTag: (data.tags || []).find((t:string) => ['Free', 'Free/Paid', 'Paid'].includes(t)) || '',
        cost: data.cost || "Free",
      });
      setTasks(data.tasks || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching game:", error);
      alert("Failed to load game");
      router.push("/admin");
    }
  };

  const addTask = () => {
    setTasks([...tasks, {
      title: '',
      description: '',
      type: 'social',
      reward: '',
      link: '',
      status: 'ongoing',
      order: tasks.length,
    }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: string, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/p2e/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: [...formData.tags.split(',').map((t:string) => t.trim()).filter(Boolean), formData.costTag].filter(Boolean),
          tasks,
        }),
      });

      if (!response.ok) throw new Error("Failed to update game");

      alert("P2E Game updated successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Failed to update game");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Edit P2E Game</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Game Type</label>
                <input
                  type="text"
                  name="gameType"
                  value={formData.gameType}
                  onChange={handleChange}
                  placeholder="e.g., RPG, Strategy, Card Game"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Blockchain</label>
                <input
                  type="text"
                  name="blockchain"
                  value={formData.blockchain}
                  onChange={handleChange}
                  placeholder="e.g., Ethereum, Polygon, BSC"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Token Symbol</label>
                <input
                  type="text"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleChange}
                  placeholder="e.g., GAME, AXS"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Potential Earnings
                </label>
                <input
                  type="text"
                  name="earnings"
                  value={formData.earnings}
                  onChange={handleChange}
                  placeholder="e.g., $50-200/month"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Play Link</label>
              <input
                type="url"
                name="playLink"
                value={formData.playLink}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Website URL</label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.image && (
                <div className="mt-3">
                  <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="max-w-xs rounded-lg border border-gray-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                💡 Tip: You can add images in the description using Markdown: ![alt text](image-url)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Cost Category</label>
                <select
                  name="costTag"
                  value={formData.costTag}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None / Unspecified</option>
                  <option value="Free">Free</option>
                  <option value="Free/Paid">Free/Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Cost (Text label)</label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., Free, $10, 0.1 ETH"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Other Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. NFT, Strategy"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="coming-soon">Coming Soon</option>
                <option value="inactive">Inactive</option>
                <option value="hidden">Hidden (Draft)</option>
              </select>
            </div>

            {/* Tasks Section */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Tasks (Can be added over time)
                </h3>
                <button
                  type="button"
                  onClick={addTask}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  <FaPlus /> Add Task
                </button>
              </div>

              {tasks.map((task, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-300">Task {index + 1}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        task.status === 'ended'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-green-900 text-green-300'
                      }`}>
                        {task.status === 'ended' ? 'Ended' : 'Ongoing'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <input
                      type="text"
                      placeholder="Task Title"
                      value={task.title}
                      onChange={(e) => updateTask(index, 'title', e.target.value)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <textarea
                      placeholder="Task Description"
                      value={task.description}
                      onChange={(e) => updateTask(index, 'description', e.target.value)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />

                    <div className="grid md:grid-cols-4 gap-3">
                      <select
                        value={task.type}
                        onChange={(e) => updateTask(index, 'type', e.target.value)}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="social">Social</option>
                        <option value="transaction">Transaction</option>
                        <option value="verification">Verification</option>
                        <option value="quiz">Quiz</option>
                        <option value="other">Other</option>
                      </select>

                      <select
                        value={task.status || 'ongoing'}
                        onChange={(e) => updateTask(index, 'status', e.target.value)}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ongoing">Ongoing</option>
                        <option value="ended">Ended</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Reward (optional)"
                        value={task.reward}
                        onChange={(e) => updateTask(index, 'reward', e.target.value)}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      />

                      <input
                        type="url"
                        placeholder="Link (optional)"
                        value={task.link}
                        onChange={(e) => updateTask(index, 'link', e.target.value)}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No tasks added yet. Click "Add Task" to add tasks that users need to complete.
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update P2E Game"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
