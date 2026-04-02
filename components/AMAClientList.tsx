'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendar, FaUsers, FaLink, FaChevronLeft, FaChevronRight, FaGlobe } from 'react-icons/fa';
import { useTimezone } from './TimezoneProvider';
import { stripMarkdown } from '@/lib/stripMarkdown';

interface AMA {
  _id: string;
  slug?: string;
  title: string;
  description: string;
  image?: string;
  project: string;
  date: string;
  platform?: string;
  status: 'live' | 'upcoming' | 'completed';
  preAMA?: boolean;
  preAMADetails?: string;
}

interface AMAClientListProps {
  initialLiveAMAs: AMA[];
  initialUpcomingAMAs: AMA[];
  initialCompletedAMAs: AMA[];
}

export default function AMAClientList({ 
  initialLiveAMAs, 
  initialUpcomingAMAs, 
  initialCompletedAMAs 
}: AMAClientListProps) {
  const { formatDateTime, timezoneLabel } = useTimezone();
  const [liveAMAs, setLiveAMAs] = useState<AMA[]>(initialLiveAMAs);
  const [upcomingAMAs, setUpcomingAMAs] = useState<AMA[]>(initialUpcomingAMAs);
  const [endedAMAs, setEndedAMAs] = useState<AMA[]>(initialCompletedAMAs);
  const [endedPage, setEndedPage] = useState(1);
  const [endedTotal, setEndedTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch total count on mount
  useEffect(() => {
    async function fetchTotalCount() {
      try {
        const res = await fetch('/api/ama?status=completed&page=1&limit=6', { cache: 'no-store' });
        const data = await res.json();
        setEndedTotal(data.pagination?.total || initialCompletedAMAs.length);
      } catch (error) {
        console.error('Error fetching total count:', error);
        setEndedTotal(initialCompletedAMAs.length);
      }
    }
    fetchTotalCount();
  }, []);

  useEffect(() => {
    // Only fetch when page changes (for pagination)
    if (endedPage === 1) return;
    
    async function fetchEndedAMAs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ama?status=completed&page=${endedPage}&limit=6`, { cache: 'no-store' });
        const data = await res.json();
        setEndedAMAs(data.data || []);
        setEndedTotal(data.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching AMAs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEndedAMAs();
  }, [endedPage]);

  const renderAMACard = (ama: AMA) => (
    <div key={ama._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition">
      <div className="w-full h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
        {ama.image ? (
          <img src={ama.image} alt={ama.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="text-white text-center p-6">
            <div className="text-4xl mb-2">🎙️</div>
            <div className="font-bold text-lg">{ama.project}</div>
            <div className="text-sm opacity-90">AMA Session</div>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{ama.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{stripMarkdown(ama.description)}</p>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <FaUsers className="text-purple-500 flex-shrink-0" />
            <span className="truncate"><strong>Project:</strong> {ama.project}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendar className="text-purple-500 flex-shrink-0" />
            <span className="truncate text-xs">{formatDateTime(ama.date)}</span>
          </div>
          {ama.platform && (
            <div className="flex items-center gap-2">
              <FaLink className="text-purple-500 flex-shrink-0" />
              <span className="truncate"><strong>Platform:</strong> {ama.platform}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            ama.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            ama.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {ama.status === 'live' ? '🔴 Live' : ama.status === 'upcoming' ? 'Upcoming' : 'Ended'}
          </span>
          {ama.preAMA && ama.status === 'upcoming' && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" title={ama.preAMADetails || 'Pre-AMA activities available'}>
              🎯 Pre-AMA Activities Available
            </span>
          )}
        </div>

        <Link
          href={`/ama/${ama.slug || ama._id}`}
          className="mt-auto block text-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const hasAnyAMAs = liveAMAs.length > 0 || upcomingAMAs.length > 0 || endedAMAs.length > 0;

  return (
    <>
      {!hasAnyAMAs && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            No AMA sessions yet. Check back soon!
          </p>
        </div>
      )}

      {/* Live AMAs */}
      {liveAMAs.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Now</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveAMAs.map(renderAMACard)}
          </div>
        </div>
      )}

      {/* Upcoming AMAs */}
      {upcomingAMAs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Upcoming Sessions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingAMAs.map(renderAMACard)}
          </div>
        </div>
      )}

      {/* Ended AMAs with Pagination */}
      {endedAMAs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Past Sessions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {endedAMAs.map(renderAMACard)}
          </div>
          
          {/* Pagination */}
          {endedTotal > 6 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setEndedPage(p => Math.max(1, p - 1))}
                disabled={endedPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {endedPage} of {Math.ceil(endedTotal / 6)}
              </span>
              <button
                onClick={() => setEndedPage(p => p + 1)}
                disabled={endedPage >= Math.ceil(endedTotal / 6)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Timezone Display */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
          <FaGlobe className="text-blue-500" />
          <span>Times shown in: <strong>{timezoneLabel}</strong></span>
        </div>
      </div>
    </>
  );
}
