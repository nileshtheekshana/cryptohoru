'use client';

import { FaCalendar, FaGlobe } from 'react-icons/fa';
import { useTimezone } from './TimezoneProvider';

interface AirdropDatesProps {
  startDate?: string;
  endDate?: string;
}

export default function AirdropDates({ startDate, endDate }: AirdropDatesProps) {
  const { formatDateTime, timezoneLabel } = useTimezone();

  if (!startDate && !endDate) return null;

  return (
    <>
      {startDate && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FaCalendar className="text-blue-500" />
            <span>{formatDateTime(startDate)}</span>
          </div>
        </div>
      )}

      {endDate && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FaCalendar className="text-red-500" />
            <span>{formatDateTime(endDate)}</span>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <FaGlobe className="text-blue-500" />
          <span>Timezone: {timezoneLabel}</span>
        </div>
      </div>
    </>
  );
}
