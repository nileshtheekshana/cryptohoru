"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Giveaway {
  _id: string;
  title: string;
  description: string;
  prize: string;
  endDate: string;
  requirements: string[];
  link?: string;
  image?: string;
  status: string;
}

export default function EditGiveawayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "",
    endDate: "",
    requirements: [""],
    link: "",
    image: "",
    status: "active",
  });

  useEffect(() => {
    fetchGiveaway();
  }, [resolvedParams.id]);

  const fetchGiveaway = async () => {
    try {
      const response = await fetch(`/api/giveaways/${resolvedParams.id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch giveaway");
      const result = await response.json();
      const data = result.data || result;
      setGiveaway(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        prize: data.prize || "",
        endDate: data.endDate?.split("T")[0] || "",
        requirements: data.requirements?.length > 0 ? data.requirements : [""],
        link: data.link || "",
        image: data.image || data.imageUrl || "",
        status: data.status || "active",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching giveaway:", error);
      alert("Failed to load giveaway");
      router.push("/admin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/giveaways/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.filter((r) => r.trim() !== ""),
        }),
      });

      if (!response.ok) throw new Error("Failed to update giveaway");

      alert("Giveaway updated successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error updating giveaway:", error);
      alert("Failed to update giveaway");
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

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ""],
    });
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      requirements: newRequirements.length > 0 ? newRequirements : [""],
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
          <h1 className="text-3xl font-bold text-white mb-8">Edit Giveaway</h1>

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
                <label className="block text-gray-300 mb-2">Prize *</label>
                <input
                  type="text"
                  name="prize"
                  value={formData.prize}
                  onChange={handleChange}
                  required
                  placeholder="e.g., $1000 USDT"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Requirements *
              </label>
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) =>
                      handleRequirementChange(index, e.target.value)
                    }
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Requirement
              </button>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Participation Link *
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                required
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
                <option value="active">Live (Active)</option>
                <option value="upcoming">Upcoming</option>
                <option value="ended">Ended</option>
                <option value="hidden">Hidden (Draft)</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update Giveaway"}
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
