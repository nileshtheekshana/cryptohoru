'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { FaParachuteBox, FaComments, FaGift, FaGamepad, FaNewspaper, FaBlog, FaPlus, FaTrash, FaEye, FaEdit, FaSync, FaShareAlt, FaCopy, FaTimes, FaKey } from 'react-icons/fa';

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
  const [items, setItems] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [socialPostModal, setSocialPostModal] = useState<{ show: boolean; item: any; type: string } | null>(null);

  const fetchCounts = async () => {
    try {
      const endpoints = ['airdrops', 'ama', 'giveaways', 'p2e', 'news', 'blog'];
      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            // Include hidden items for admin
            const res = await fetch(`/api/${endpoint}?includeHidden=true`, { cache: 'no-store' });
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
    }
  };

  const fetchItems = async (type: string) => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      // Include hidden items for admin
      const res = await fetch(`/api/${type}?includeHidden=true&t=${timestamp}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Remove duplicates on client side as backup
        const uniqueItems = Array.from(
          new Map(data.data?.map((item: any) => [item._id, item]) || []).values()
        );
        setItems(uniqueItems);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Item deleted successfully!');
        fetchItems(type);
        fetchCounts();
      } else {
        alert('Failed to delete item.');
      }
    } catch (error) {
      alert('Error deleting item.');
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  const generateSocialPost = (type: string, item: any): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cryptohoru.com';
    const postUrl = `${baseUrl}${sections.find(s => s.id === type)?.path}/${item._id}`;
    
    switch (type) {
      case 'airdrops':
        let airdropPost = `🚀 NEW AIRDROP ALERT! 🚀\n\n`;
        airdropPost += `📣 ${item.title}\n\n`;
        if (item.reward) airdropPost += `💰 Reward: ${item.reward}\n`;
        if (item.blockchain) airdropPost += `⛓️ Chain: ${item.blockchain}\n`;
        if (item.tasks?.length) airdropPost += `📋 Tasks: ${item.tasks.length} to complete\n`;
        if (item.endDate) airdropPost += `⏰ Deadline: ${new Date(item.endDate).toLocaleDateString()}\n`;
        if (item.status) airdropPost += `📊 Status: ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}\n`;
        airdropPost += `\n✅ Don't miss out! Check full details & participate:\n🔗 ${postUrl}\n\n`;
        airdropPost += `#Airdrop #Crypto #${item.blockchain || 'Web3'} #FreeCrypto`;
        return airdropPost;
        
      case 'giveaways':
        let giveawayPost = `🎉 GIVEAWAY TIME! 🎉\n\n`;
        giveawayPost += `🎁 ${item.title}\n\n`;
        if (item.prize) giveawayPost += `🏆 Prize: ${item.prize}\n`;
        if (item.project) giveawayPost += `🏢 By: ${item.project}\n`;
        if (item.winners) giveawayPost += `👥 Winners: ${item.winners}\n`;
        if (item.endDate) giveawayPost += `⏰ Ends: ${new Date(item.endDate).toLocaleDateString()}\n`;
        if (item.requirements?.length) giveawayPost += `📝 Requirements: ${item.requirements.length} steps\n`;
        giveawayPost += `\n🍀 Try your luck! Full details:\n🔗 ${postUrl}\n\n`;
        giveawayPost += `#Giveaway #Crypto #Contest #Win`;
        return giveawayPost;
        
      case 'ama':
        let amaPost = `🎙️ AMA SESSION ANNOUNCEMENT 🎙️\n\n`;
        amaPost += `🎤 ${item.title}\n\n`;
        if (item.project) amaPost += `🏢 Project: ${item.project}\n`;
        if (item.host) amaPost += `👤 Host: ${item.host}\n`;
        if (item.date) amaPost += `📅 Date: ${new Date(item.date).toLocaleDateString()}\n`;
        if (item.date) amaPost += `🕐 Time: ${new Date(item.date).toLocaleTimeString()}\n`;
        if (item.platform) amaPost += `📍 Platform: ${item.platform}\n`;
        amaPost += `\n❓ Got questions? Join us!\n🔗 ${postUrl}\n\n`;
        amaPost += `#AMA #Crypto #AskMeAnything #Web3`;
        return amaPost;
        
      case 'p2e':
        let p2ePost = `🎮 PLAY-TO-EARN SPOTLIGHT 🎮\n\n`;
        p2ePost += `🕹️ ${item.title}\n\n`;
        if (item.blockchain) p2ePost += `⛓️ Blockchain: ${item.blockchain}\n`;
        if (item.gameType) p2ePost += `🎯 Genre: ${item.gameType}\n`;
        if (item.tokenSymbol) p2ePost += `🪙 Token: $${item.tokenSymbol}\n`;
        if (item.earnings) p2ePost += `💵 Earnings: ${item.earnings}\n`;
        if (item.status) p2ePost += `📊 Status: ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}\n`;
        p2ePost += `\n🎯 Start earning now!\n🔗 ${postUrl}\n\n`;
        p2ePost += `#P2E #PlayToEarn #GameFi #Crypto`;
        return p2ePost;
        
      case 'news':
        let newsPost = `📰 CRYPTO NEWS UPDATE 📰\n\n`;
        newsPost += `📌 ${item.title}\n\n`;
        if (item.category) newsPost += `📂 Category: ${item.category}\n`;
        if (item.source) newsPost += `📡 Source: ${item.source}\n`;
        if (item.author) newsPost += `✍️ By: ${item.author}\n`;
        newsPost += `\n📖 Read the full story:\n🔗 ${postUrl}\n\n`;
        newsPost += `#CryptoNews #Blockchain #Web3`;
        return newsPost;
        
      case 'blog':
        let blogPost = `📝 NEW BLOG POST 📝\n\n`;
        blogPost += `✨ ${item.title}\n\n`;
        if (item.author) blogPost += `✍️ Written by: ${item.author}\n`;
        if (item.category) blogPost += `📂 Category: ${item.category}\n`;
        if (item.tags?.length) blogPost += `🏷️ Topics: ${item.tags.slice(0, 3).join(', ')}\n`;
        blogPost += `\n📚 Read more:\n🔗 ${postUrl}\n\n`;
        blogPost += `#CryptoBlog #Blockchain #Web3`;
        return blogPost;
      default:
        return `${item.title}\n\n🔗 ${postUrl}`;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sections = [
    { id: 'airdrops', name: 'Airdrops', icon: <FaParachuteBox />, color: 'blue', path: '/airdrops' },
    { id: 'ama', name: 'AMA', icon: <FaComments />, color: 'purple', path: '/ama' },
    { id: 'giveaways', name: 'Giveaways', icon: <FaGift />, color: 'green', path: '/giveaways' },
    { id: 'p2e', name: 'P2E Games', icon: <FaGamepad />, color: 'orange', path: '/p2e-games' },
    { id: 'news', name: 'News', icon: <FaNewspaper />, color: 'red', path: '/news' },
    { id: 'blog', name: 'Blog', icon: <FaBlog />, color: 'indigo', path: '/blog' },
  ];

  const currentSection = sections.find(s => s.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="opacity-90">Manage your content across all sections</p>
            </div>
            <Link
              href="/admin/api-keys"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <FaKey /> API Keys
            </Link>
          </div>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Manage {currentSection?.name}
              </h2>
              {!loading && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Total: {counts[activeTab as keyof ContentCounts]} items
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  fetchItems(activeTab);
                  fetchCounts();
                }}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                <FaSync /> Refresh
              </button>
              <Link
                href={`/admin/${activeTab}/new`}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <FaPlus /> Add New
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No {currentSection?.name.toLowerCase()} yet.
              </p>
              <Link
                href={`/admin/${activeTab}/new`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First One
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: any) => (
                <div
                  key={item._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-500 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {item.description || item.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {item.status && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.status === 'active' || item.status === 'live'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : item.status === 'upcoming' || item.status === 'coming-soon'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : item.status === 'hidden'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {item.status === 'hidden' ? '🔒 Hidden (Draft)' : item.status}
                          </span>
                        )}
                        {/* Show unpublished for blog/news */}
                        {item.published === false && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            🔒 Unpublished (Draft)
                          </span>
                        )}
                        {item.createdAt && (
                          <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                        )}
                        {item.category && (
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`${currentSection?.path}/${item._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                        target="_blank"
                      >
                        <FaEye /> View
                      </Link>
                      <Link
                        href={`/admin/${activeTab}/${item._id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                      >
                        <FaEdit /> {activeTab === 'airdrops' ? 'Manage Tasks' : 'Edit'}
                      </Link>
                      <button
                        onClick={() => setSocialPostModal({ show: true, item, type: activeTab })}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
                      >
                        <FaShareAlt /> Social Post
                      </button>
                      <button
                        onClick={() => handleDelete(activeTab, item._id)}
                        disabled={deleting === item._id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm font-semibold"
                      >
                        <FaTrash /> {deleting === item._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Social Post Modal */}
      {socialPostModal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Social Media Post</h3>
              <button
                onClick={() => setSocialPostModal(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {generateSocialPost(socialPostModal.type, socialPostModal.item)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(generateSocialPost(socialPostModal.type, socialPostModal.item))}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <FaCopy /> Copy Post
              </button>
              <Link
                href={`${sections.find(s => s.id === socialPostModal.type)?.path}/${socialPostModal.item._id}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                <FaEye /> View on Site
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
