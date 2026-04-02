'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function NewGiveawayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdItem, setCreatedItem] = useState<any | null>(null);
  const [snippet, setSnippet] = useState('');
  const [showSnippet, setShowSnippet] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    prize: '',
    endDate: '',
    requirements: '',
    link: '',
    image: '',
    status: 'active', // Active = Live for users
    tags: '',
    costTag: '',
    cost: 'Free',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/giveaways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements.split('\n').filter(Boolean),
          tags: [...formData.tags.split(',').map(t => t.trim()).filter(Boolean), formData.costTag].filter(Boolean),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const created = result.data || result;
        setCreatedItem(created);
        // generate snippet with limited info (no links)
        const snippetText = `📣 ${created.title} — Prize: ${created.prize}${created.project ? ` • ${created.project}` : ''}. Ends ${created.endDate ? new Date(created.endDate).toLocaleDateString() : 'soon'}. Details on our website.`;
        setSnippet(snippetText);
        setShowSnippet(true);
      } else {
        alert('Failed to create giveaway.');
      }
    } catch (error) {
      alert('Error creating giveaway.');
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
            Add New Giveaway
          </h1>

          {showSnippet && createdItem && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900 p-4 rounded">
              <h3 className="font-semibold text-gray-800 dark:text-yellow-200 mb-2">Social post (limited info, no links)</h3>
              <p className="text-gray-700 dark:text-gray-200 mb-3 whitespace-pre-wrap">{snippet}</p>
              <div className="flex gap-2">
                <button onClick={copySnippet} type="button" className="bg-blue-600 text-white px-4 py-2 rounded">Copy Post</button>
                <Link href={`/giveaways/${createdItem._id}`} className="px-4 py-2 border rounded text-gray-800 dark:text-gray-200">View on site</Link>
                <Link href="/admin" className="px-4 py-2 border rounded text-gray-800 dark:text-gray-200">Done</Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Giveaway title"
              />
            </div>

            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              label="Description"
              required
              rows={8}
              placeholder="Describe the giveaway... Use Markdown for formatting and images."
            />

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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Project name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Prize *
              </label>
              <input
                type="text"
                name="prize"
                value={formData.prize}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 1000 USDT, 10 NFTs"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Requirements (one per line) *
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Follow Twitter&#10;Retweet pinned post&#10;Join Telegram"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Tip: You can also add images in the description using Markdown: ![alt text](image-url)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cost Category
                </label>
                <select
                  name="costTag"
                  value={formData.costTag}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">None / Unspecified</option>
                  <option value="Free">Free</option>
                  <option value="Free/Paid">Free/Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cost (Text label)
                </label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="E.g., Free, $10, 0.1 ETH"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Other Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Crypto, Twitter"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Participation Link *
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Live (Active) - Default for new giveaways</option>
                <option value="upcoming">Upcoming</option>
                <option value="ended">Ended</option>
                <option value="hidden">Hidden (Draft)</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creating...' : 'Create Giveaway'}
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
