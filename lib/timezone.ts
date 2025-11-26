// Get user's timezone from IP using free API
export async function getUserTimezone(): Promise<string> {
  try {
    const res = await fetch('https://ipapi.co/json/', { 
      cache: 'no-store',
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    const data = await res.json();
    return data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    // Fallback to browser timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

// Format date in user's timezone
export function formatDateInTimezone(date: Date | string, timezone: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(dateObj);
}

// Get timezone abbreviation
export function getTimezoneAbbr(timezone: string): string {
  const date = new Date();
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  }).format(date);
  
  const parts = formatted.split(' ');
  return parts[parts.length - 1];
}
