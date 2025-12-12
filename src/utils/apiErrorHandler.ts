/**
 * API Error Handler for Portal Paraiso API v2.0
 * Handles error responses with timer and premium information
 */

import axios, { AxiosError } from 'axios';
import { TimerData } from './timerUtils';

export interface ApiErrorDetails {
  readings_used?: number;
  readings_limit?: number;
  readings_remaining?: number;
  questions_used?: number;
  questions_limit?: number;
  questions_remaining?: number;
  cards_allowed?: number;
  cards_min?: number;
  cards_max?: number;
  shells_allowed?: number;
  next_reset?: string;
  timer?: TimerData;
  show_timer?: boolean;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  isPremiumRequired?: boolean;
  upgrade_required?: boolean;
  details?: ApiErrorDetails;
  minCardsAllowed?: number;
  maxCardsAllowed?: number;
  cardsSelected?: number;
  statusCode?: number;
}

/**
 * Extracts error information from API error response
 */
export const parseApiError = (error: unknown): ApiErrorResponse | null => {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const response = error.response;
  if (!response || !response.data) {
    return null;
  }

  const data = response.data as any;

  // Check if it's an error response (success: false)
  if (data.success === false) {
    return {
      success: false,
      message: data.message || 'An error occurred',
      isPremiumRequired: data.isPremiumRequired ?? false,
      upgrade_required: data.upgrade_required ?? false,
      details: data.details || undefined,
      minCardsAllowed: data.minCardsAllowed,
      maxCardsAllowed: data.maxCardsAllowed,
      cardsSelected: data.cardsSelected,
      statusCode: response.status,
    };
  }

  return null;
};

/**
 * Checks if error is a daily limit error
 */
export const isDailyLimitError = (error: unknown): boolean => {
  const apiError = parseApiError(error);
  if (!apiError) return false;

  return (
    apiError.isPremiumRequired === true &&
    (apiError.details?.readings_remaining === 0 ||
      apiError.details?.questions_remaining === 0)
  );
};

/**
 * Checks if error is a card limit error (too many cards selected)
 */
export const isCardLimitError = (error: unknown): boolean => {
  const apiError = parseApiError(error);
  if (!apiError) return false;

  return (
    apiError.statusCode === 400 &&
    apiError.minCardsAllowed !== undefined &&
    apiError.maxCardsAllowed !== undefined
  );
};

/**
 * Gets timer information from error response
 */
export const getTimerFromError = (error: unknown): TimerData | null => {
  const apiError = parseApiError(error);
  return apiError?.details?.timer || null;
};

/**
 * Gets user-friendly error message with context
 */
export const getErrorMessageWithContext = (
  error: unknown,
): {
  message: string;
  isPremiumRequired: boolean;
  timer: TimerData | null;
  showTimer: boolean;
  details?: ApiErrorDetails;
} => {
  const apiError = parseApiError(error);

  if (apiError) {
    return {
      message: apiError.message,
      isPremiumRequired: apiError.isPremiumRequired ?? false,
      timer: apiError.details?.timer || null,
      showTimer: apiError.details?.show_timer ?? false,
      details: apiError.details,
    };
  }

  // Fallback for non-API errors
  let message = 'An unknown error occurred';
  if (axios.isAxiosError(error)) {
    message =
      error.response?.data?.message ||
      error.message ||
      'Network error occurred';
  } else if (error instanceof Error) {
    message = error.message;
  }

  return {
    message,
    isPremiumRequired: false,
    timer: null,
    showTimer: false,
  };
};

/**
 * Checks if feature requires premium upgrade
 */
export const requiresPremiumUpgrade = (error: unknown): boolean => {
  const apiError = parseApiError(error);
  return (
    apiError?.isPremiumRequired === true || apiError?.upgrade_required === true
  );
};
