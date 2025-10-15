'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaParachuteBox, FaComments, FaGift, FaGamepad, FaNewspaper, FaBlog, FaPlus } from 'react-icons/fa';

interface ContentCounts {
  airdrops: number;
  ama: number;
  giveaways: number;
  p2e: number;
  news: number;
  blog: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('airdrops');
  const [counts, setCounts] = useState<ContentCounts>({
    airdrops: 0,
    ama: 0,
    giveaways: 0,
    p2e: 0,
    news: 0,
    blog: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const endpoints = ['airdrops', 'ama', 'giveaways', 'p2e', 'news', 'blog'];
        const results = await Promise.all(
          endpoints.map(async (endpoint) => {
            try {
              const res = await fetch(`/api/${endpoint}`);
              if (res.ok) {
                const data = await res.json();
                return { endpoint, count: data.data?.length || 0 };
              }
              return { endpoint, count: 0 };
            } catch {
              return { endpoint, count: 0 };
            }
          })
        );
        
        const newCounts: any = {};
        results.forEach(({ endpoint, count }) => {
          newCounts[endpoint] = count;
        });
        setCounts(newCounts);
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const sections = [
    { id: 'airdrops', name: 'Airdrops', icon: <FaParachuteBox />, color: 'blue' },
    { id: 'ama', name: 'AMA', icon: <FaComments />, color: 'purple' },
    { id: 'giveaways', name: 'Giveaways', icon: <FaGift />, color: 'green' },
    { id: 'p2e', name: 'P2E Games', icon: <FaGamepad />, color: 'orange' },
    { id: 'news', name: 'News', icon: <FaNewspaper />, color: 'red' },
    { id: 'blog', name: 'Blog', icon: <FaBlog />, color: 'indigo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="opacity-90">Manage your content across all sections</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const isActive = activeTab === section.id;
              const bgColorClass = isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${bgColorClass}`}
                >
                  {section.icon}
                  {section.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Airdrops Section */}
          {activeTab === 'airdrops' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Airdrops</h2>
                  {!loading && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Total: {counts.airdrops} {counts.airdrops === 1 ? 'airdrop' : 'airdrops'}
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/airdrops/new"
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  <FaPlus /> Add New Airdrop
                </Link>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add airdrops and manage tasks that can be added over time as the airdrop progresses.
              </p>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              ) : counts.airdrops > 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <p className="text-green-800 dark:text-green-300 mb-2">
                    ✅ {counts.airdrops} {counts.airdrops === 1 ? 'airdrop is' : 'airdrops are'} active
                  </p>
                  <Link href="/airdrops" className="text-blue-600 dark:text-blue-400 hover:underline">
                    View on public page →
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No airdrops yet. Click "Add New Airdrop" to create one.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AMA Section */}
          {activeTab === 'ama' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage AMA Sessions</h2>
                  {!loading && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Total: {counts.ama} {counts.ama === 1 ? 'session' : 'sessions'}
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/ama/new"
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  <FaPlus /> Add New AMA
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              ) : counts.ama > 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <p className="text-green-800 dark:text-green-300 mb-2">
                    ✅ {counts.ama} AMA {counts.ama === 1 ? 'session' : 'sessions'}
                  </p>
                  <Link href="/ama" className="text-blue-600 dark:text-blue-400 hover:underline">
                    View on public page →
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No AMA sessions yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Giveaways Section */}
          {activeTab === 'giveaways' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Giveaways</h2>
                  {!loading && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Total: {counts.giveaways} {counts.giveaways === 1 ? 'giveaway' : 'giveaways'}
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/giveaways/new"
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  <FaPlus /> Add New Giveaway
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              ) : counts.giveaways > 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <p className="text-green-800 dark:text-green-300 mb-2">
                    ✅ {counts.giveaways} {counts.giveaways === 1 ? 'giveaway' : 'giveaways'}
                  </p>
                  <Link href="/giveaways" className="text-blue-600 dark:text-blue-400 hover:underline">
                    View on public page →
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No giveaways yet.</p>
                </div>
              )}
            </div>
          )}

          {/* P2E Games Section */}
          {activeTab === 'p2e' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage P2E Games</h2>
                  {!loading && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Total: {counts.p2e} {counts.p2e === 1 ? 'game' : 'games'}
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/p2e/new"
                  className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  <FaPlus /> Add New Game
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              ) : counts.p2e > 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <p className="text-green-800 dark:text-green-300 mb-2">
                    ✅ {counts.p2e} P2E {counts.p2e === 1 ? 'game' : 'games'}
                  </p>
                  <Link href="/p2e-games" className="text-blue-600 dark:text-blue-400 hover:underline">
                    View on public page →
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No P2E games yet.</p>
                </div>
              )}
            </div>
          )}

          {/* News Section */}
          {activeTab === 'news' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage News</h2>
                  {!loading && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Total: {counts.news} {counts.news === 1 ? 'article' : 'articles'}
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/news/new"
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  <FaPlus /> Add News Article
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              ) : counts.news > 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <p className="text-green-800 dark:text-green-300 mb-2">
                    ✅ {counts.news} news {counts.news === 1 ? 'article' : 'articles'}
                  </p>
                  <Link href="/news" className="text-blue-600 dark:text-blue-400 hover:underline">
                    View on public page →
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No news articles yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Blog Section */}
          {activeTab === 'blog' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Blog Posts</h2>
                  {!loading && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Total: {counts.blog} {counts.blog === 1 ? 'post' : 'posts'}
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/blog/new"
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  <FaPlus /> Add New Post
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              ) : counts.blog > 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <p className="text-green-800 dark:text-green-300 mb-2">
                    ✅ {counts.blog} blog {counts.blog === 1 ? 'post' : 'posts'}
                  </p>
                  <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
                    View on public page →
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No blog posts yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
            🔧 Setup Required
          </h3>
          <p className="text-blue-800 dark:text-blue-400 mb-4">
            To start using the admin panel, you need to:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
            <li>Set up MongoDB Atlas (free plan available)</li>
            <li>Add your connection string to <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">.env.local</code></li>
            <li>Create an admin user</li>
          </ol>
          <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">
            Check the <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">SETUP.md</code> file for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
