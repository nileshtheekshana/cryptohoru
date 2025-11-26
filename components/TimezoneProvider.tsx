'use client';

import { useEffect, useState } from 'react';

interface TimezoneProviderProps {
  children: (timezone: string) => React.ReactNode;
}

export default function TimezoneProvider({ children }: TimezoneProviderProps) {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detectTimezone() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        } else {
          setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
      } catch (error) {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      } finally {
        setLoading(false);
      }
    }

    detectTimezone();
  }, []);

  if (loading) {
    return null;
  }

  return <>{children(timezone)}</>;
}
