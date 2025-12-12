/**
 * Timer Utilities for Portal Paraiso API v2.0
 * Handles countdown timers for daily limit resets
 */

export interface TimerData {
  hours: number;
  minutes: number;
  seconds: number;
  total_ms: number;
  total_seconds: number;
  reset_time: string; // ISO timestamp
  reset_timestamp: number; // Unix timestamp in ms
}

export interface TimerDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  shortFormatted: string;
}

/**
 * Formats timer data for display
 * @param timer - Timer data from API
 * @returns Formatted timer display object
 */
export const formatTimer = (timer: TimerData | null): TimerDisplay | null => {
  if (!timer) return null;

  const hours = Math.max(0, timer.hours);
  const minutes = Math.max(0, timer.minutes);
  const seconds = Math.max(0, timer.seconds);

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}h ${minutes}m ${seconds}s`,
    shortFormatted:
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`,
  };
};

/**
 * Creates a countdown timer from total seconds
 * @param totalSeconds - Total seconds until reset
 * @returns Timer display object
 */
export const createCountdownFromSeconds = (
  totalSeconds: number,
): TimerDisplay => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    formatted: `${hours}h ${minutes}m ${seconds}s`,
    shortFormatted:
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`,
  };
};

/**
 * Calculates time remaining until reset from reset timestamp
 * @param resetTimestamp - Unix timestamp in milliseconds
 * @returns Timer display object or null if already reset
 */
export const calculateTimeRemaining = (
  resetTimestamp: number,
): TimerDisplay | null => {
  const now = Date.now();
  const remaining = resetTimestamp - now;

  if (remaining <= 0) {
    return null; // Timer has expired
  }

  return createCountdownFromSeconds(Math.floor(remaining / 1000));
};

/**
 * Checks if timer has expired
 * @param timer - Timer data from API
 * @returns true if timer has expired
 */
export const isTimerExpired = (timer: TimerData | null): boolean => {
  if (!timer) return true;
  return timer.total_seconds <= 0 || Date.now() >= timer.reset_timestamp;
};

/**
 * Gets the next reset time (midnight) for a given date
 * @param date - Optional date, defaults to now
 * @returns Unix timestamp in milliseconds for next midnight
 */
export const getNextMidnight = (date: Date = new Date()): number => {
  const nextMidnight = new Date(date);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime();
};

/**
 * Formats timer for user-friendly display
 * @param timer - Timer data or seconds
 * @returns Formatted string
 */
export const formatTimerForDisplay = (
  timer: TimerData | number | null,
): string => {
  if (!timer) return '';

  let totalSeconds: number;
  if (typeof timer === 'number') {
    totalSeconds = timer;
  } else {
    totalSeconds = timer.total_seconds;
  }

  if (totalSeconds <= 0) return 'Available now';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Hook-like function to get timer state (for use in components)
 * Returns timer info that updates based on current time
 */
export const getCurrentTimerState = (
  timer: TimerData | null,
): {
  isExpired: boolean;
  display: TimerDisplay | null;
  totalSeconds: number;
} => {
  if (!timer) {
    return {
      isExpired: true,
      display: null,
      totalSeconds: 0,
    };
  }

  const now = Date.now();
  const remaining = timer.reset_timestamp - now;
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));

  return {
    isExpired: totalSeconds <= 0,
    display: totalSeconds > 0 ? createCountdownFromSeconds(totalSeconds) : null,
    totalSeconds,
  };
};
