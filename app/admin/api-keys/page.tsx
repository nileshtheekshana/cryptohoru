'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaKey, FaPlus, FaCopy, FaTrash, FaCheck } from 'react-icons/fa';

interface APIKey {
  _id: string;
  name: string;
  key: string;
  description?: string;
  permissions: string[];
  status: string;
  rateLimit: number;
  usageCount: number;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

export default function APIKeysAdminPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    rateLimit: 100,
    expiresInDays: 0, // 0 = never expires
  });

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      setApiKeys(data.data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.permissions.length === 0) {
      alert('Please select at least one permission');
      return;
    }

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`API Key created successfully!\n\nKey: ${result.data.key}\n\nCopy this key now - it won't be shown again!`);
        setShowCreateForm(false);
        fetchAPIKeys();
        setFormData({
          name: '',
          description: '',
          permissions: [],
          rateLimit: 100,
          expiresInDays: 0,
        });
      } else {
        alert('Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Error creating API key');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('API key revoked successfully');
        fetchAPIKeys();
      } else {
        alert('Failed to revoke API key');
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      alert('Error revoking API key');
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const allPermissions = [
    { value: 'create:airdrop', label: 'Create Airdrops' },
    { value: 'create:ama', label: 'Create AMAs' },
    { value: 'create:giveaway', label: 'Create Giveaways' },
    { value: 'create:blog', label: 'Create Blog Posts' },
    { value: 'create:news', label: 'Create News' },
    { value: 'create:p2e', label: 'Create P2E Games' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <FaKey className="text-blue-600" />
                API Keys
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage API keys for external integrations
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FaPlus /> Create API Key
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Create New API Key</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="My AI Bot"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Used for AI-powered event posting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Permissions * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allPermissions.map((perm) => (
                      <label
                        key={perm.value}
                        className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.value)}
                          onChange={() => togglePermission(perm.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Rate Limit (requests per day)
                    </label>
                    <input
                      type="number"
                      value={formData.rateLimit}
                      onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                      min="1"
                      max="10000"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Expires in (days, 0 = never)
                    </label>
                    <input
                      type="number"
                      value={formData.expiresInDays}
                      onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                      min="0"
                      max="365"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Create API Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* API Keys List */}
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                No API keys yet. Create one to get started!
              </div>
            ) : (
              apiKeys.map((key) => (
                <div
                  key={key._id}
                  className={`border rounded-lg p-6 ${
                    key.status === 'active'
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{key.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            key.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {key.status}
                        </span>
                      </div>
                      {key.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{key.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                          {key.key.substring(0, 10)}...{key.key.substring(key.key.length - 10)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                          title="Copy full key"
                        >
                          {copiedKey === key.key ? (
                            <FaCheck className="text-green-600" />
                          ) : (
                            <FaCopy className="text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {key.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded text-xs font-semibold"
                          >
                            {perm.replace('create:', '')}
                          </span>
                        ))}
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>
                          <strong>Usage:</strong> {key.usageCount} / {key.rateLimit} requests today
                        </div>
                        {key.lastUsed && (
                          <div>
                            <strong>Last used:</strong> {new Date(key.lastUsed).toLocaleString()}
                          </div>
                        )}
                        {key.expiresAt && (
                          <div>
                            <strong>Expires:</strong> {new Date(key.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                        <div>
                          <strong>Created:</strong> {new Date(key.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {key.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(key._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm"
                      >
                        <FaTrash /> Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Documentation Link */}
          <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">📚 API Documentation</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              See <Link href="/admin/api-docs" className="text-blue-600 dark:text-blue-400 hover:underline">API Documentation</Link> for usage examples and endpoint details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
