"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AMA {
  _id: string;
  title: string;
  description: string;
  project: string;
  host: string;
  date: string;
  platform: string;
  link?: string;
  rewards?: string;
  image?: string;
  status: string;
}

export default function EditAMAPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ama, setAma] = useState<AMA | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    host: "",
    date: "",
    time: "",
    platform: "",
    link: "",
    rewards: "",
    image: "",
    status: "upcoming",
    preAMA: false,
    preAMADetails: "",
  });

  useEffect(() => {
    fetchAMA();
  }, [resolvedParams.id]);

  const fetchAMA = async () => {
    try {
      const response = await fetch(`/api/ama/${resolvedParams.id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch AMA");
      const result = await response.json();
      const data = result.data;
      setAma(data);
      
      // Extract date and time from datetime
      const dateObj = new Date(data.date);
      const dateStr = dateObj.toISOString().split('T')[0];
      // Extract time in HH:MM format (local time)
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      
      setFormData({
        title: data.title || "",
        description: data.description || "",
        project: data.project || "",
        host: data.host || "",
        date: dateStr,
        time: timeStr,
        platform: data.platform || "",
        link: data.link || "",
        rewards: data.rewards || "",
        image: data.image || "",
        status: data.status || "upcoming",
        preAMA: data.preAMA || false,
        preAMADetails: data.preAMADetails || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching AMA:", error);
      alert("Failed to load AMA");
      router.push("/admin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Combine date and time into a single ISO datetime string
      const combinedDateTime = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}:00`).toISOString()
        : formData.date;

      const submitData = {
        ...formData,
        date: combinedDateTime,
      };

      const response = await fetch(`/api/ama/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error("Failed to update AMA");

      alert("AMA updated successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error updating AMA:", error);
      alert("Failed to update AMA");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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
          <h1 className="text-3xl font-bold text-white mb-8">Edit AMA Session</h1>

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
                <label className="block text-gray-300 mb-2">Project *</label>
                <input
                  type="text"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Host *</label>
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Platform *</label>
                <input
                  type="text"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Twitter Spaces, Discord, Telegram"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Join Link</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Rewards</label>
              <input
                type="text"
                name="rewards"
                value={formData.rewards}
                onChange={handleChange}
                placeholder="e.g., $100 USDT"
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
            </div>

            {/* Pre-AMA Activities */}
            <div className="border border-purple-500 rounded-lg p-4 bg-purple-900/20">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="preAMA"
                  name="preAMA"
                  checked={formData.preAMA}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="preAMA" className="text-sm font-semibold text-gray-300 cursor-pointer">
                  🎯 Has Pre-AMA Activities
                </label>
              </div>
              {formData.preAMA && (
                <div>
                  <label className="block text-gray-300 mb-2">Pre-AMA Details</label>
                  <textarea
                    name="preAMADetails"
                    value={formData.preAMADetails}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the pre-AMA activities (e.g., Follow on Twitter, Join Telegram, etc.)"
                  />
                </div>
              )}
            </div>

            {/* Pre-AMA Activities */}
            <div className="border border-purple-500 rounded-lg p-4 bg-purple-900/20">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="preAMA"
                  name="preAMA"
                  checked={formData.preAMA}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="preAMA" className="text-sm font-semibold text-gray-300 cursor-pointer">
                  🎯 Has Pre-AMA Activities
                </label>
              </div>
              {formData.preAMA && (
                <div>
                  <label className="block text-gray-300 mb-2">Pre-AMA Details</label>
                  <textarea
                    name="preAMADetails"
                    value={formData.preAMADetails}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the pre-AMA activities (e.g., Follow on Twitter, Join Telegram, etc.)"
                  />
                </div>
              )}
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
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="hidden">Hidden (Draft)</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update AMA Session"}
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
