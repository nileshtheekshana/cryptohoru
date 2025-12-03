'use client';

import { FaCalendar, FaGlobe } from 'react-icons/fa';
import { useTimezone } from './TimezoneProvider';

interface GiveawayDatesProps {
  endDate?: string;
}

export default function GiveawayDates({ endDate }: GiveawayDatesProps) {
  const { formatDateTime, timezoneLabel } = useTimezone();

  if (!endDate) return null;

  return (
    <>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
        <div className="flex items-center gap-2">
          <FaCalendar className="text-red-500" />
          <span className="text-gray-900 dark:text-white">
            {formatDateTime(endDate)}
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
