'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchAndFilter({ 
  hideStatusFilters = false 
}: { 
  hideStatusFilters?: boolean 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleFilterChange('q', query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const currentStatus = searchParams.get('status') || '';

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Search and Tags Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
          />
        </div>
        
        <div className="md:w-64">
          <select
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              handleFilterChange('tag', e.target.value);
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition cursor-pointer appearance-none"
          >
            <option value="">All Cost Categories</option>
            <option value="Free">Free</option>
            <option value="Free/Paid">Free/Paid</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Status Filters */}
      {!hideStatusFilters && (
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setStatus(''); handleFilterChange('status', ''); }}
            className={`px-6 py-2 rounded-lg font-semibold transition border ${
              !currentStatus 
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => { setStatus('active'); handleFilterChange('status', 'active'); }}
            className={`px-6 py-2 rounded-lg font-semibold transition border ${
              currentStatus === 'active'
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Active
          </button>
          <button 
            onClick={() => { setStatus('upcoming'); handleFilterChange('status', 'upcoming'); }}
            className={`px-6 py-2 rounded-lg font-semibold transition border ${
              currentStatus === 'upcoming'
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => { setStatus('ended'); handleFilterChange('status', 'ended'); }}
            className={`px-6 py-2 rounded-lg font-semibold transition border ${
              currentStatus === 'ended'
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Ended
          </button>
        </div>
      )}
    </div>
  );
}
