'use client';

import { useState, useRef, useEffect } from 'react';
import { FaGlobe, FaChevronDown, FaCheck } from 'react-icons/fa';
import { useTimezone, TIMEZONES } from './TimezoneProvider';

export default function TimezoneSelector() {
  const { timezone, setTimezone, timezoneLabel } = useTimezone();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTimezones = TIMEZONES.filter(tz => 
    tz.label.toLowerCase().includes(search.toLowerCase()) ||
    tz.value.toLowerCase().includes(search.toLowerCase())
  );

  const currentOffset = TIMEZONES.find(tz => tz.value === timezone)?.offset || '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        title="Change timezone"
      >
        <FaGlobe className="text-blue-500" />
        <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
          {timezoneLabel}
        </span>
        <span className="sm:hidden text-gray-700 dark:text-gray-300">
          {currentOffset || 'TZ'}
        </span>
        <FaChevronDown className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search timezone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredTimezones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => {
                  setTimezone(tz.value);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition ${
                  timezone === tz.value ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{tz.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{tz.value}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{tz.offset}</span>
                  {timezone === tz.value && <FaCheck className="text-blue-500" />}
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              All event times will be shown in your selected timezone
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
