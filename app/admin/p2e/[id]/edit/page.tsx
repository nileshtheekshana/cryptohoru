"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface P2EGame {
  _id: string;
  title: string;
  description: string;
  gameType?: string;
  blockchain?: string;
  earnings?: string;
  playLink?: string;
  websiteUrl?: string;
  imageUrl?: string;
  status: string;
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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gameType: "",
    blockchain: "",
    earnings: "",
    playLink: "",
    websiteUrl: "",
    imageUrl: "",
    status: "active",
  });

  useEffect(() => {
    fetchGame();
  }, [resolvedParams.id]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/p2e/${resolvedParams.id}`);
      if (!response.ok) throw new Error("Failed to fetch game");
      const data = await response.json();
      setGame(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        gameType: data.gameType || "",
        blockchain: data.blockchain || "",
        earnings: data.earnings || "",
        playLink: data.playLink || "",
        websiteUrl: data.websiteUrl || "",
        imageUrl: data.imageUrl || "",
        status: data.status || "active",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching game:", error);
      alert("Failed to load game");
      router.push("/admin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/p2e/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                <option value="upcoming">Upcoming</option>
                <option value="ended">Ended</option>
              </select>
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
