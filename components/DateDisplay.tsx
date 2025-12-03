'use client';

import { useTimezone } from './TimezoneProvider';
import { FaGlobe } from 'react-icons/fa';

interface DateDisplayProps {
  date: string | Date;
  showTimezone?: boolean;
  format?: 'date' | 'datetime' | 'time';
  className?: string;
}

export default function DateDisplay({ 
  date, 
  showTimezone = false, 
  format = 'datetime',
  className = ''
}: DateDisplayProps) {
  const { formatDate, formatDateTime, formatTime, timezoneLabel } = useTimezone();

  const formattedDate = format === 'date' 
    ? formatDate(date) 
    : format === 'time' 
      ? formatTime(date) 
      : formatDateTime(date);

  return (
    <span className={className}>
      {formattedDate}
      {showTimezone && (
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
          ({timezoneLabel})
        </span>
      )}
    </span>
  );
}

// Wrapper for use in non-client components (shows static date, hydrates to user timezone)
export function DateDisplayWrapper({ 
  date, 
  showTimezone = false,
  format = 'datetime',
  className = ''
}: DateDisplayProps) {
  return (
    <DateDisplay 
      date={date} 
      showTimezone={showTimezone} 
      format={format}
      className={className}
    />
  );
}
