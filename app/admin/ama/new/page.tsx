'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function NewAMAPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    host: '',
    date: '',
    time: '',
    platform: '',
    platformLink: '',
    imageUrl: '',
    image: '',
    status: 'upcoming',
    preAMA: false,
    preAMADetails: '',
  });
  const [createdItem, setCreatedItem] = useState<any | null>(null);
  const [snippet, setSnippet] = useState('');
  const [showSnippet, setShowSnippet] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time into a single ISO datetime string
      // The date and time are in admin's local timezone, we store as UTC
      const combinedDateTime = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}:00`).toISOString()
        : formData.date;

      const submitData = {
        ...formData,
        date: combinedDateTime,
      };

      const response = await fetch('/api/ama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        const created = result.data || result;
        setCreatedItem(created);
        // generate a short snippet with date, project and host
        const when = created.date ? new Date(created.date).toLocaleString() : '';
        const snippetText = `🎤 AMA: ${created.title}${created.project ? ` • ${created.project}` : ''}${created.host ? ` • Host: ${created.host}` : ''}${when ? ` • ${when}` : ''}. Join the conversation — details on our website.`;
        setSnippet(snippetText);
        setShowSnippet(true);
      } else {
        alert('Failed to create AMA session.');
      }
    } catch (error) {
      alert('Error creating AMA session.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      alert('Post copied to clipboard');
    } catch (err) {
      console.error('Clipboard error', err);
      alert('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <FaArrowLeft /> Back to Admin
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            Add New AMA Session
          </h1>

          {showSnippet && createdItem && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900 p-4 rounded">
              <h3 className="font-semibold text-gray-800 dark:text-yellow-200 mb-2">Social post (limited info, no links)</h3>
              <p className="text-gray-700 dark:text-gray-200 mb-3 whitespace-pre-wrap">{snippet}</p>
              <div className="flex gap-2">
                <button onClick={copySnippet} type="button" className="bg-blue-600 text-white px-4 py-2 rounded">Copy Post</button>
                <Link href={`/ama/${createdItem._id}`} className="px-4 py-2 border rounded text-gray-800 dark:text-gray-200">View on site</Link>
                <Link href="/admin" className="px-4 py-2 border rounded text-gray-800 dark:text-gray-200">Done</Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="AMA with Project Name"
              />
            </div>

            {/* Description */}
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              label="Description"
              required
              rows={8}
              placeholder="Describe what this AMA is about... Use Markdown for formatting and images."
            />

            {/* Grid for Project & Host */}

            {/* Project Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Project name"
              />
            </div>

            {/* Host */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Host *
              </label>
              <input
                type="text"
                name="host"
                value={formData.host}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Host name or company"
              />
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Platform *
              </label>
              <input
                type="text"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Twitter Space, Discord, Telegram"
              />
            </div>

            {/* Platform Link */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Platform Link *
              </label>
              <input
                type="url"
                name="platformLink"
                value={formData.platformLink}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>

            {/* Pre-AMA Activities */}
            <div className="border border-purple-300 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="preAMA"
                  name="preAMA"
                  checked={formData.preAMA}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="preAMA" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  🎯 Has Pre-AMA Activities
                </label>
              </div>
              {formData.preAMA && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pre-AMA Details
                  </label>
                  <textarea
                    name="preAMADetails"
                    value={formData.preAMADetails}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the pre-AMA activities (e.g., Follow on Twitter, Join Telegram, etc.)"
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="hidden">Hidden (Draft)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating...' : 'Create AMA Session'}
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
