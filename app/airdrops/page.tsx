import Link from 'next/link';
import { FaExternalLinkAlt, FaTwitter, FaTelegram, FaDiscord, FaGlobe, FaClock, FaCheckCircle } from 'react-icons/fa';

async function getAirdrops() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/airdrops`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Failed to fetch airdrops');
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching airdrops:', error);
    return [];
  }
}

export default async function AirdropsPage() {
  const airdrops = await getAirdrops();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Crypto Airdrops</h1>
          <p className="text-xl opacity-90">
            Discover and participate in the latest cryptocurrency airdrops. Complete tasks over time as they become available.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            All
          </button>
          <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
            Active
          </button>
          <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
            Upcoming
          </button>
          <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-300 dark:border-gray-600">
            Ended
          </button>
        </div>

        {/* Airdrops Grid */}
        {airdrops.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No airdrops found. Connect your MongoDB database to see real data.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {airdrops.map((airdrop) => (
              <div
                key={airdrop._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-400">
                  {airdrop.image && (
                    <img
                      src={airdrop.image}
                      alt={airdrop.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      airdrop.status === 'active' ? 'bg-green-500 text-white' :
                      airdrop.status === 'upcoming' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {airdrop.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                    {airdrop.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {airdrop.description}
                  </p>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FaCheckCircle className="mr-2 text-green-500" />
                      <span>Reward: <strong>{airdrop.reward}</strong></span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FaClock className="mr-2 text-blue-500" />
                      <span>Blockchain: <strong>{airdrop.blockchain}</strong></span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {airdrop.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Tasks Preview */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tasks: {airdrop.tasks?.length || 0}
                    </p>
                    <div className="space-y-1">
                      {airdrop.tasks?.slice(0, 2).map((task, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <input type="checkbox" className="mr-2" readOnly />
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {airdrop.tasks && airdrop.tasks.length > 2 && (
                        <p className="text-xs text-gray-500">+{airdrop.tasks.length - 2} more tasks</p>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-3 mb-4">
                    {airdrop.website && (
                      <a href={airdrop.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                        <FaGlobe size={20} />
                      </a>
                    )}
                    {airdrop.twitter && (
                      <a href={airdrop.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition">
                        <FaTwitter size={20} />
                      </a>
                    )}
                    {airdrop.telegram && (
                      <a href={airdrop.telegram} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition">
                        <FaTelegram size={20} />
                      </a>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Link
                    href={`/airdrops/${airdrop._id}`}
                    className="w-full block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
                  >
                    View Details & Tasks
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
