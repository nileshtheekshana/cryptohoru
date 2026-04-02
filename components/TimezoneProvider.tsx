'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: string | Date) => string;
  formatTime: (date: string | Date) => string;
  timezoneLabel: string;
  loading: boolean;
}

const DEFAULT_TIMEZONE = 'Asia/Kolkata'; // IST +5:30

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

// Comprehensive timezones list - sorted by offset
export const TIMEZONES = [
  // UTC-12 to UTC-9
  { value: 'Pacific/Midway', label: 'Midway Island', offset: '-11:00' },
  { value: 'Pacific/Honolulu', label: 'Hawaii', offset: '-10:00' },
  { value: 'America/Anchorage', label: 'Alaska', offset: '-9:00' },
  
  // UTC-8 to UTC-5
  { value: 'America/Los_Angeles', label: 'PST (Los Angeles, Vancouver)', offset: '-8:00' },
  { value: 'America/Tijuana', label: 'Tijuana, Mexico', offset: '-8:00' },
  { value: 'America/Denver', label: 'MST (Denver, Phoenix)', offset: '-7:00' },
  { value: 'America/Chicago', label: 'CST (Chicago, Dallas)', offset: '-6:00' },
  { value: 'America/Mexico_City', label: 'Mexico City', offset: '-6:00' },
  { value: 'America/New_York', label: 'EST (New York, Toronto)', offset: '-5:00' },
  { value: 'America/Bogota', label: 'Bogota, Lima', offset: '-5:00' },
  
  // UTC-4 to UTC-1
  { value: 'America/Caracas', label: 'Caracas', offset: '-4:00' },
  { value: 'America/Santiago', label: 'Santiago, Chile', offset: '-4:00' },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Brazil', offset: '-3:00' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', offset: '-3:00' },
  { value: 'Atlantic/South_Georgia', label: 'Mid-Atlantic', offset: '-2:00' },
  { value: 'Atlantic/Azores', label: 'Azores', offset: '-1:00' },
  
  // UTC+0
  { value: 'UTC', label: 'UTC', offset: '+0:00' },
  { value: 'Europe/London', label: 'GMT (London, Dublin)', offset: '+0:00' },
  { value: 'Africa/Casablanca', label: 'Casablanca, Morocco', offset: '+0:00' },
  { value: 'Africa/Accra', label: 'Accra, Ghana', offset: '+0:00' },
  
  // UTC+1 to UTC+2
  { value: 'Europe/Paris', label: 'CET (Paris, Berlin)', offset: '+1:00' },
  { value: 'Europe/Berlin', label: 'Berlin, Amsterdam', offset: '+1:00' },
  { value: 'Europe/Madrid', label: 'Madrid, Rome', offset: '+1:00' },
  { value: 'Africa/Lagos', label: 'Lagos, Nigeria', offset: '+1:00' },
  { value: 'Europe/Athens', label: 'Athens, Helsinki', offset: '+2:00' },
  { value: 'Africa/Cairo', label: 'Cairo, Egypt', offset: '+2:00' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', offset: '+2:00' },
  { value: 'Europe/Istanbul', label: 'Istanbul, Turkey', offset: '+3:00' },
  
  // UTC+3 to UTC+4
  { value: 'Europe/Moscow', label: 'Moscow, St. Petersburg', offset: '+3:00' },
  { value: 'Asia/Riyadh', label: 'Riyadh, Saudi Arabia', offset: '+3:00' },
  { value: 'Africa/Nairobi', label: 'Nairobi, Kenya', offset: '+3:00' },
  { value: 'Asia/Tehran', label: 'Tehran, Iran', offset: '+3:30' },
  { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi', offset: '+4:00' },
  { value: 'Asia/Baku', label: 'Baku, Azerbaijan', offset: '+4:00' },
  { value: 'Asia/Kabul', label: 'Kabul, Afghanistan', offset: '+4:30' },
  
  // UTC+5 to UTC+5:45
  { value: 'Asia/Karachi', label: 'Karachi, Pakistan', offset: '+5:00' },
  { value: 'Asia/Tashkent', label: 'Tashkent, Uzbekistan', offset: '+5:00' },
  { value: 'Asia/Kolkata', label: 'IST (India, Sri Lanka)', offset: '+5:30' },
  { value: 'Asia/Colombo', label: 'Colombo, Sri Lanka', offset: '+5:30' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu, Nepal', offset: '+5:45' },
  
  // UTC+6 to UTC+7
  { value: 'Asia/Dhaka', label: 'Dhaka, Bangladesh', offset: '+6:00' },
  { value: 'Asia/Almaty', label: 'Almaty, Kazakhstan', offset: '+6:00' },
  { value: 'Asia/Yangon', label: 'Yangon, Myanmar', offset: '+6:30' },
  { value: 'Asia/Bangkok', label: 'Bangkok, Thailand', offset: '+7:00' },
  { value: 'Asia/Jakarta', label: 'Jakarta, Indonesia', offset: '+7:00' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh, Vietnam', offset: '+7:00' },
  
  // UTC+8 to UTC+9
  { value: 'Asia/Singapore', label: 'Singapore', offset: '+8:00' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: '+8:00' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai', offset: '+8:00' },
  { value: 'Asia/Taipei', label: 'Taipei, Taiwan', offset: '+8:00' },
  { value: 'Asia/Manila', label: 'Manila, Philippines', offset: '+8:00' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur, Malaysia', offset: '+8:00' },
  { value: 'Australia/Perth', label: 'Perth, Australia', offset: '+8:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan', offset: '+9:00' },
  { value: 'Asia/Seoul', label: 'Seoul, South Korea', offset: '+9:00' },
  
  // UTC+9:30 to UTC+12
  { value: 'Australia/Darwin', label: 'Darwin, Australia', offset: '+9:30' },
  { value: 'Australia/Brisbane', label: 'Brisbane, Australia', offset: '+10:00' },
  { value: 'Pacific/Guam', label: 'Guam', offset: '+10:00' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne', offset: '+11:00' },
  { value: 'Pacific/Noumea', label: 'New Caledonia', offset: '+11:00' },
  { value: 'Pacific/Auckland', label: 'Auckland, New Zealand', offset: '+12:00' },
  { value: 'Pacific/Fiji', label: 'Fiji', offset: '+12:00' },
  { value: 'Pacific/Tongatapu', label: 'Tonga', offset: '+13:00' },
];

// Function to detect timezone from IP
async function detectTimezoneFromIP(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(3000) 
    });
    if (res.ok) {
      const data = await res.json();
      return data.timezone || null;
    }
  } catch (error) {
    console.log('IP timezone detection failed');
  }
  return null;
}

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [timezone, setTimezoneState] = useState<string>(DEFAULT_TIMEZONE);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize timezone
  useEffect(() => {
    const initTimezone = async () => {
      // 1. Check localStorage first
      const savedTz = localStorage.getItem('cryptohoru_timezone');
      if (savedTz) {
        setTimezoneState(savedTz);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // 2. Try to detect from IP
      const ipTimezone = await detectTimezoneFromIP();
      if (ipTimezone) {
        setTimezoneState(ipTimezone);
        localStorage.setItem('cryptohoru_timezone', ipTimezone);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // 3. Fallback to browser timezone
      try {
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTz) {
          setTimezoneState(browserTz);
          localStorage.setItem('cryptohoru_timezone', browserTz);
        }
      } catch {
        // Keep default IST
      }
      setLoading(false);
      setIsInitialized(true);
    };

    initTimezone();
  }, []);

  // Sync with user's saved timezone when logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user && isInitialized) {
      // Fetch user's timezone from database
      fetch('/api/users/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user?.timezone) {
            // If user has saved timezone, use it
            setTimezoneState(data.user.timezone);
            localStorage.setItem('cryptohoru_timezone', data.user.timezone);
          } else if (timezone !== DEFAULT_TIMEZONE) {
            // If user doesn't have saved timezone but we detected one, save it
            fetch('/api/users/timezone', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ timezone }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [status, session, isInitialized]);

  const setTimezone = async (tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem('cryptohoru_timezone', tz);
    
    // Save to database if logged in
    if (session?.user) {
      try {
        await fetch('/api/users/timezone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timezone: tz }),
        });
      } catch (error) {
        console.error('Failed to save timezone to database');
      }
    }
  };

  const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(dateObj);
  };

  const formatDateTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  };

  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  };

  const timezoneLabel = TIMEZONES.find(tz => tz.value === timezone)?.label || timezone;

  return (
    <TimezoneContext.Provider value={{
      timezone,
      setTimezone,
      formatDate,
      formatDateTime,
      formatTime,
      timezoneLabel,
      loading,
    }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}

// For backward compatibility
export default TimezoneProvider;
