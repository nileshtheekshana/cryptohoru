'use client';

import Link from 'next/link';
import { FaGlobe, FaTwitter, FaTelegram, FaClock, FaCheckCircle, FaCalendar, FaTicketAlt } from 'react-icons/fa';
import { useTimezone } from './TimezoneProvider';
import { stripMarkdown } from '@/lib/stripMarkdown';

interface Task {
  _id?: string;
  title: string;
  description: string;
  type?: string;
  reward?: string;
  link?: string;
}

interface Airdrop {
  _id: string;
  slug?: string;
  title: string;
  description: string;
  image?: string;
  status: 'active' | 'upcoming' | 'ended';
  reward?: string;
  blockchain?: string;
  category?: string;
  cost?: string;
  startDate?: string;
  endDate?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  tags?: string[];
  requirements?: string[];
  tasks?: Task[];
  createdAt?: string;
}

interface AirdropCardListProps {
  airdrops: Airdrop[];
}

export default function AirdropCardList({ airdrops }: AirdropCardListProps) {
  const { formatDateTime, timezoneLabel } = useTimezone();

  if (airdrops.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          No airdrops found. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {airdrops.map((airdrop: Airdrop) => (
          <div
            key={airdrop._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition"
          >
            {/* Image */}
            <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              {airdrop.image ? (
                <img src={airdrop.image} alt={airdrop.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="text-white text-center p-6">
                  <div className="text-4xl mb-2">🪂</div>
                  <div className="font-bold text-lg line-clamp-2">{airdrop.title}</div>
                  <div className="text-sm opacity-90">Airdrop</div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                {airdrop.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {stripMarkdown(airdrop.description)}
              </p>
              
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  airdrop.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  airdrop.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {airdrop.status.toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                {airdrop.reward && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaCheckCircle className="mr-2 text-green-500 flex-shrink-0" />
                    <span>Reward: <strong>{airdrop.reward}</strong></span>
                  </div>
                )}
                {airdrop.blockchain && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaClock className="mr-2 text-blue-500 flex-shrink-0" />
                    <span>Blockchain: <strong>{airdrop.blockchain}</strong></span>
                  </div>
                )}
                {airdrop.endDate && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaCalendar className="mr-2 text-red-500 flex-shrink-0" />
                    <span className="text-xs">Ends: <strong>{formatDateTime(airdrop.endDate)}</strong></span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <FaTicketAlt className="mr-2 text-purple-500 flex-shrink-0" />
                  <span>Cost: <strong>{airdrop.cost || 'Free'}</strong></span>
                </div>
              </div>

              {/* Tags */}
              {airdrop.tags && airdrop.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {airdrop.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Tasks Preview */}
              {airdrop.tasks && airdrop.tasks.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tasks: {airdrop.tasks.length}
                  </p>
                  <div className="space-y-1">
                    {airdrop.tasks.slice(0, 2).map((task: Task, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <input type="checkbox" className="mr-2" readOnly />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                    {airdrop.tasks.length > 2 && (
                      <p className="text-xs text-gray-500">+{airdrop.tasks.length - 2} more tasks</p>
                    )}
                  </div>
                </div>
              )}

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
                href={`/airdrops/${airdrop.slug || airdrop._id}`}
                className="mt-auto block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
              >
                View Details & Tasks
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Timezone indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
          <FaGlobe className="text-blue-500" />
          <span>Times shown in: <strong>{timezoneLabel}</strong></span>
        </div>
      </div>
    </>
  );
}
