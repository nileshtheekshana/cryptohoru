"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Blog {
  _id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  slug?: string;
}

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [blog, setBlog] = useState<Blog | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    category: "",
    tags: [""],
    image: "",
  });

  useEffect(() => {
    fetchBlog();
  }, [resolvedParams.id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blog/${resolvedParams.id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch blog");
      const result = await response.json();
      const data = result.data || result;
      setBlog(data);
      setFormData({
        title: data.title || "",
        content: data.content || "",
        author: data.author || "",
        category: data.category || "",
        tags: data.tags?.length > 0 ? data.tags : [""],
        image: data.image || data.imageUrl || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blog:", error);
      alert("Failed to load blog");
      router.push("/admin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/blog/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.filter((t) => t.trim() !== ""),
        }),
      });

      if (!response.ok) throw new Error("Failed to update blog");

      alert("Blog post updated successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog");
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

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const addTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, ""],
    });
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      tags: newTags.length > 0 ? newTags : [""],
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
          <h1 className="text-3xl font-bold text-white mb-8">Edit Blog Post</h1>

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
              <label className="block text-gray-300 mb-2">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={12}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="e.g., DeFi, NFT, Tutorial"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Tags</label>
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder={`Tag ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Tag
              </button>
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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update Blog Post"}
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
