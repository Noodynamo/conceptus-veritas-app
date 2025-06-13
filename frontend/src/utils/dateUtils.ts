/**
 * Date utility functions
 */

/**
 * Format a date string or Date object into a human-readable format
 * @param date Date string or Date object to format
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a date to display relative time (e.g., "2 days ago", "in 3 hours")
 * @param date Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date | null): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  // Future date
  if (diffMs > 0) {
    if (diffSec < 60) return `in ${diffSec} second${diffSec !== 1 ? 's' : ''}`;
    if (diffMin < 60) return `in ${diffMin} minute${diffMin !== 1 ? 's' : ''}`;
    if (diffHour < 24) return `in ${diffHour} hour${diffHour !== 1 ? 's' : ''}`;
    if (diffDay < 30) return `in ${diffDay} day${diffDay !== 1 ? 's' : ''}`;
    return formatDate(dateObj);
  }

  // Past date
  const absDiffSec = Math.abs(diffSec);
  const absDiffMin = Math.abs(diffMin);
  const absDiffHour = Math.abs(diffHour);
  const absDiffDay = Math.abs(diffDay);

  if (absDiffSec < 60) return `${absDiffSec} second${absDiffSec !== 1 ? 's' : ''} ago`;
  if (absDiffMin < 60) return `${absDiffMin} minute${absDiffMin !== 1 ? 's' : ''} ago`;
  if (absDiffHour < 24) return `${absDiffHour} hour${absDiffHour !== 1 ? 's' : ''} ago`;
  if (absDiffDay < 30) return `${absDiffDay} day${absDiffDay !== 1 ? 's' : ''} ago`;
  return formatDate(dateObj);
}

/**
 * Format time duration in seconds to a human-readable format
 * @param seconds Number of seconds
 * @returns Formatted time string (e.g., "2h 30m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}
