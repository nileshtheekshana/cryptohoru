'use client';

import { FaCalendar, FaGlobe } from 'react-icons/fa';
import { useTimezone } from './TimezoneProvider';

interface AMADatesProps {
  date?: string;
}

export default function AMADates({ date }: AMADatesProps) {
  const { formatDateTime, timezoneLabel } = useTimezone();

  if (!date) return null;

  return (
    <>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date & Time</p>
        <div className="flex items-center gap-2">
          <FaCalendar className="text-purple-500" />
          <span className="text-gray-900 dark:text-white">
            {formatDateTime(date)}
          </span>
        </div>
      </div>
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <FaGlobe className="text-blue-500" />
          <span>Timezone: {timezoneLabel}</span>
        </div>
      </div>
    </>
  );
}
