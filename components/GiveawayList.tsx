'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaGift, FaCalendar, FaCheckCircle, FaChevronLeft, FaChevronRight, FaGlobe, FaTicketAlt } from 'react-icons/fa';
import { useTimezone } from './TimezoneProvider';
import { stripMarkdown } from '@/lib/stripMarkdown';
import SearchAndFilter from './SearchAndFilter';

interface Giveaway {
  _id: string;
  slug?: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  prize: string;
  endDate: string;
  requirements: string[];
  cost?: string;
  status: 'active' | 'live' | 'upcoming' | 'ended';
}

export default function GiveawayList() {
  const { formatDateTime, timezoneLabel } = useTimezone();
  const [liveGiveaways, setLiveGiveaways] = useState<Giveaway[]>([]);
  const [upcomingGiveaways, setUpcomingGiveaways] = useState<Giveaway[]>([]);
  const [endedGiveaways, setEndedGiveaways] = useState<Giveaway[]>([]);
  const [endedPage, setEndedPage] = useState(1);
  const [endedTotal, setEndedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';

  useEffect(() => {
    async function fetchGiveaways() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (q) queryParams.set('q', q);
        if (tag) queryParams.set('tag', tag);
        const baseQuery = queryParams.toString() ? `&${queryParams.toString()}` : '';

        const [liveRes, upcomingRes, endedRes] = await Promise.all([
          fetch(`/api/giveaways?status=live${baseQuery}`, { cache: 'no-store' }),
          fetch(`/api/giveaways?status=upcoming&limit=100${baseQuery}`, { cache: 'no-store' }),
          fetch(`/api/giveaways?status=ended&page=${endedPage}&limit=6${baseQuery}`, { cache: 'no-store' })
        ]);

        const liveData = await liveRes.json();
        const upcomingData = await upcomingRes.json();
        const endedData = await endedRes.json();

        setLiveGiveaways(liveData.data || []);
        setUpcomingGiveaways(upcomingData.data || []);
        setEndedGiveaways(endedData.data || []);
        setEndedTotal(endedData.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching giveaways:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGiveaways();
  }, [endedPage, q, tag]);

  const getGiveawayStatus = (giveaway: Giveaway): 'live' | 'upcoming' | 'ended' => {
    // Check if giveaway has ended
    const now = new Date();
    const end = new Date(giveaway.endDate);
    
    if (end < now) {
      return 'ended';
    }
    
    // Use database status for live/upcoming (manually set by admin)
    // Map 'active' status to 'live' for display
    if (giveaway.status === 'active') {
      return 'live';
    } else if (giveaway.status === 'upcoming') {
      return 'upcoming';
    }
    
    // Default to live if status is not set
    return 'live';
  };

  const renderGiveawayCard = (giveaway: Giveaway) => {
    const dynamicStatus = getGiveawayStatus(giveaway);
    
    return (
    <div key={giveaway._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition">
      <div className="w-full h-48 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
        {giveaway.imageUrl || giveaway.image ? (
          <img src={giveaway.imageUrl || giveaway.image} alt={giveaway.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="text-white text-center p-6">
            <div className="text-4xl mb-2">🎁</div>
            <div className="font-bold text-lg">{giveaway.title}</div>
            <div className="text-sm opacity-90">Giveaway</div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{giveaway.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{stripMarkdown(giveaway.description)}</p>
      
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <FaGift className="text-green-500" />
            <span><strong>Prize:</strong> {giveaway.prize}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaCalendar className="text-green-500" />
            <span className="text-xs"><strong>Ends:</strong> {formatDateTime(giveaway.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaTicketAlt className="text-green-500" />
            <span><strong>Cost:</strong> {giveaway.cost || 'Free'}</span>
          </div>
          
          <div className="flex gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              dynamicStatus === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
              dynamicStatus === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {dynamicStatus === 'live' ? '🔴 Live' : dynamicStatus === 'upcoming' ? 'Upcoming' : 'Ended'}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Requirements:</p>
          <ul className="space-y-1">
            {giveaway.requirements.slice(0, 3).map((req: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{req}</span>
              </li>
            ))}
            {giveaway.requirements.length > 3 && (
              <li className="text-sm text-gray-500 dark:text-gray-500 italic">
                +{giveaway.requirements.length - 3} more
              </li>
            )}
          </ul>
        </div>

        <Link
          href={`/giveaways/${giveaway.slug || giveaway._id}`}
          className="mt-auto block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const hasAnyGiveaways = liveGiveaways.length > 0 || upcomingGiveaways.length > 0 || endedGiveaways.length > 0;

  if (!hasAnyGiveaways) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          No giveaways available. Check back soon!
        </p>
      </div>
    );
  }

  const endedTotalPages = Math.ceil(endedTotal / 6);

  return (
    <div className="space-y-12">
      <SearchAndFilter hideStatusFilters={true} />
      
      {/* Live Giveaways */}
      {liveGiveaways.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live Giveaways
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveGiveaways.map(renderGiveawayCard)}
          </div>
        </div>
      )}

      {/* Upcoming Giveaways */}
      {upcomingGiveaways.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Upcoming Giveaways</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingGiveaways.map(renderGiveawayCard)}
          </div>
        </div>
      )}

      {/* Past Giveaways */}
      {endedGiveaways.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Past Giveaways</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {endedGiveaways.map(renderGiveawayCard)}
          </div>

          {/* Pagination */}
          {endedTotalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setEndedPage(p => Math.max(1, p - 1))}
                disabled={endedPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {endedPage} of {endedTotalPages}
              </span>
              <button
                onClick={() => setEndedPage(p => Math.min(endedTotalPages, p + 1))}
                disabled={endedPage === endedTotalPages}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
    </div>
  );
}
