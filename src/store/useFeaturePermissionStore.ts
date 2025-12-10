import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import axios from 'axios';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- TypeScript Interfaces matching API documentation ---

export interface FeatureAccess {
  allowed: boolean;
  dailyLimit: number;
  usedToday?: number;
  remaining?: number;
  unlimited?: boolean;
  // Feature-specific properties
  cardsPerReading?: number; // For tarot
  depth?: string; // For horoscope (e.g., "basic", "advanced")
  shellsPerReading?: number; // For buzios
}

export interface PackageInfo {
  name: string;
  type: string;
  tier: number;
}

export interface AdditionalFeatures {
  canSaveReadings: boolean;
  audioNarration: boolean;
  adFree: boolean;
  vipBadge: boolean;
  earlyAccessFeatures: boolean;
  prioritySupport: boolean;
}

export interface UsageReset {
  nextReset: string;
  resetTime: string;
}

export interface FeatureAccessData {
  tarot: FeatureAccess;
  horoscope: FeatureAccess;
  buzios: FeatureAccess;
  oracle_chat: FeatureAccess;
  showAds: boolean;
  package?: PackageInfo;
  additionalFeatures?: AdditionalFeatures;
  usageReset?: UsageReset;
  timestamp?: string;
}

export interface UsageStats {
  tarot_readings: number;
  horoscope_readings: number;
  buzios_readings: number;
  oracle_chat_messages: number;
  period: 'daily' | 'weekly' | 'monthly';
}

interface FeaturePermissionState {
  // Feature access data
  featureAccess: FeatureAccessData | null;
  lastFeatureAccessFetch: number | null;
  isFetchingFeatureAccess: boolean;
  featureAccessError: string | null;

  // Usage stats
  usageStats: UsageStats | null;
  lastUsageStatsFetch: number | null;
  isFetchingUsageStats: boolean;
  usageStatsError: string | null;

  // Actions
  fetchFeatureAccess: (force?: boolean) => Promise<boolean>;
  fetchUsageStats: (force?: boolean) => Promise<boolean>;
  refreshFeatureAccess: () => Promise<boolean>;

  // Permission check helpers
  canAccessTarot: () => boolean;
  canAccessHoroscope: () => boolean;
  canAccessBuzios: () => boolean;
  canAccessOracleChat: () => boolean;
  hasReachedDailyLimit: (
    feature: 'tarot' | 'horoscope' | 'buzios' | 'oracle_chat',
  ) => boolean;
  getRemainingUsage: (
    feature: 'tarot' | 'horoscope' | 'buzios' | 'oracle_chat',
  ) => number;

  // Additional getters
  getPackageInfo: () => PackageInfo | null;
  getAdditionalFeatures: () => AdditionalFeatures | null;
  isUnlimited: (
    feature: 'tarot' | 'horoscope' | 'buzios' | 'oracle_chat',
  ) => boolean;
}

// Cache duration constants (in milliseconds)
const FEATURE_ACCESS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const USAGE_STATS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('x-auth-token');
  if (!token) {
    throw new Error('Authentication token not found.');
  }
  return token;
};

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unknown error occurred.'
    );
  }
  return error instanceof Error ? error.message : 'An unknown error occurred.';
};

// Retry helper for critical API calls
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise<void>(resolve =>
          setTimeout(() => resolve(), delay * attempt),
        );
      }
    }
  }
  throw lastError;
};

export const useFeaturePermissionStore = create<FeaturePermissionState>(
  (set, get) => ({
    // Initial State
    featureAccess: null,
    lastFeatureAccessFetch: null,
    isFetchingFeatureAccess: false,
    featureAccessError: null,

    usageStats: null,
    lastUsageStatsFetch: null,
    isFetchingUsageStats: false,
    usageStatsError: null,

    /**
     * Fetches feature access from the API with caching.
     * @param force - If true, bypasses cache and fetches fresh data
     */
    fetchFeatureAccess: async (force: boolean = false): Promise<boolean> => {
      const state = get();
      const now = Date.now();

      // Check cache if not forcing refresh
      if (
        !force &&
        state.featureAccess &&
        state.lastFeatureAccessFetch &&
        now - state.lastFeatureAccessFetch < FEATURE_ACCESS_CACHE_DURATION
      ) {
        return true;
      }

      // Prevent concurrent fetches
      if (state.isFetchingFeatureAccess) {
        return false;
      }

      set({ isFetchingFeatureAccess: true, featureAccessError: null });

      try {
        const fetchData = async () => {
          const token = await getAuthToken();
          const response = await axios.get(
            `${API_BASEURL}/user/feature-access`,
            {
              headers: { 'x-auth-token': token },
            },
          );

          if (response.data?.success && response.data?.data?.features) {
            const data = response.data.data;
            const featureAccess: FeatureAccessData = {
              tarot: data.features.tarot || {
                allowed: false,
                dailyLimit: 0,
                unlimited: false,
              },
              horoscope: data.features.horoscope || {
                allowed: false,
                dailyLimit: 0,
                unlimited: false,
              },
              buzios: data.features.buzios || {
                allowed: false,
                dailyLimit: 0,
                unlimited: false,
              },
              oracle_chat: data.features.oracle_chat || {
                allowed: false,
                dailyLimit: 0,
                unlimited: false,
              },
              showAds: data.showAds ?? true,
              package: data.package,
              additionalFeatures: data.additionalFeatures,
              usageReset: data.usageReset,
              timestamp: data.timestamp,
            };

            set({
              featureAccess,
              lastFeatureAccessFetch: now,
              isFetchingFeatureAccess: false,
              featureAccessError: null,
            });
            return true;
          }

          throw new Error(
            response.data?.message || 'Failed to fetch feature access.',
          );
        };

        await retryApiCall(fetchData, 2, 500);
        return true;
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        set({
          featureAccessError: errorMessage,
          isFetchingFeatureAccess: false,
        });

        // If we have cached data, don't clear it on error
        if (!state.featureAccess) {
          console.error('Failed to fetch feature access:', errorMessage);
        }
        return false;
      }
    },

    /**
     * Fetches usage stats from the API with caching.
     * @param force - If true, bypasses cache and fetches fresh data
     */
    fetchUsageStats: async (force: boolean = false): Promise<boolean> => {
      const state = get();
      const now = Date.now();

      // Check cache if not forcing refresh
      if (
        !force &&
        state.usageStats &&
        state.lastUsageStatsFetch &&
        now - state.lastUsageStatsFetch < USAGE_STATS_CACHE_DURATION
      ) {
        return true;
      }

      // Prevent concurrent fetches
      if (state.isFetchingUsageStats) {
        return false;
      }

      set({ isFetchingUsageStats: true, usageStatsError: null });

      try {
        const fetchData = async () => {
          const token = await getAuthToken();
          const response = await axios.get(`${API_BASEURL}/user/usage-stats`, {
            headers: { 'x-auth-token': token },
          });

          if (response.data?.success && response.data?.data) {
            const usageStats: UsageStats = {
              tarot_readings: response.data.data.tarot_readings || 0,
              horoscope_readings: response.data.data.horoscope_readings || 0,
              buzios_readings: response.data.data.buzios_readings || 0,
              oracle_chat_messages:
                response.data.data.oracle_chat_messages || 0,
              period: response.data.data.period || 'daily',
            };

            set({
              usageStats,
              lastUsageStatsFetch: now,
              isFetchingUsageStats: false,
              usageStatsError: null,
            });
            return true;
          }

          throw new Error(
            response.data?.message || 'Failed to fetch usage stats.',
          );
        };

        await retryApiCall(fetchData, 2, 500);
        return true;
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        set({
          usageStatsError: errorMessage,
          isFetchingUsageStats: false,
        });
        console.error('Failed to fetch usage stats:', errorMessage);
        return false;
      }
    },

    /**
     * Forces a refresh of feature access data.
     */
    refreshFeatureAccess: async (): Promise<boolean> => {
      return get().fetchFeatureAccess(true);
    },

    // --- Permission Check Helpers ---

    /**
     * Checks if user can access Tarot feature.
     */
    canAccessTarot: (): boolean => {
      const { featureAccess } = get();
      return featureAccess?.tarot?.allowed === true;
    },

    /**
     * Checks if user can access Horoscope feature.
     */
    canAccessHoroscope: (): boolean => {
      const { featureAccess } = get();
      return featureAccess?.horoscope?.allowed === true;
    },

    /**
     * Checks if user can access Búzios feature.
     */
    canAccessBuzios: (): boolean => {
      const { featureAccess } = get();
      return featureAccess?.buzios?.allowed === true;
    },

    /**
     * Checks if user can access Oracle Chat feature.
     */
    canAccessOracleChat: (): boolean => {
      const { featureAccess } = get();
      return featureAccess?.oracle_chat?.allowed === true;
    },

    /**
     * Checks if user has reached daily limit for a feature.
     */
    hasReachedDailyLimit: (
      featureName: 'tarot' | 'horoscope' | 'buzios' | 'oracle_chat',
    ): boolean => {
      const { featureAccess, usageStats } = get();
      const featureData = featureAccess?.[featureName];
      if (!featureData?.allowed) return true;

      // If unlimited, never reached limit
      if (featureData.unlimited === true) return false;

      const limit = featureData.dailyLimit || 0;
      if (limit === 0) return false; // No limit set

      // Check from feature access response first (more accurate)
      if (
        featureData.usedToday !== undefined &&
        featureData.remaining !== undefined
      ) {
        return featureData.remaining <= 0;
      }

      // Fallback to usage stats
      if (usageStats) {
        const used = {
          tarot: usageStats.tarot_readings,
          horoscope: usageStats.horoscope_readings,
          buzios: usageStats.buzios_readings,
          oracle_chat: usageStats.oracle_chat_messages,
        }[featureName];

        return used >= limit;
      }

      return false;
    },

    /**
     * Gets remaining usage count for a feature.
     */
    getRemainingUsage: (
      featureName: 'tarot' | 'horoscope' | 'buzios' | 'oracle_chat',
    ): number => {
      const { featureAccess, usageStats } = get();
      const featureData = featureAccess?.[featureName];
      if (!featureData?.allowed) return 0;

      // If unlimited, return a large number (or Infinity)
      if (featureData.unlimited === true) return 9999;

      const limit = featureData.dailyLimit || 0;
      if (limit === 0) return Infinity; // No limit set

      // Check from feature access response first
      if (featureData.remaining !== undefined) {
        return Math.max(0, featureData.remaining);
      }

      // Fallback to usage stats
      if (usageStats) {
        const used = {
          tarot: usageStats.tarot_readings,
          horoscope: usageStats.horoscope_readings,
          buzios: usageStats.buzios_readings,
          oracle_chat: usageStats.oracle_chat_messages,
        }[featureName];

        return Math.max(0, limit - used);
      }

      return limit;
    },

    // Get package information
    getPackageInfo: (): PackageInfo | null => {
      const { featureAccess } = get();
      return featureAccess?.package || null;
    },

    // Get additional features
    getAdditionalFeatures: (): AdditionalFeatures | null => {
      const { featureAccess } = get();
      return featureAccess?.additionalFeatures || null;
    },

    // Check if feature has unlimited access
    isUnlimited: (
      feature: 'tarot' | 'horoscope' | 'buzios' | 'oracle_chat',
    ): boolean => {
      const { featureAccess } = get();
      return featureAccess?.[feature]?.unlimited === true;
    },
  }),
);

/**
 * Hook to check feature permissions with automatic fetching.
 * Use this in components to check if a feature is accessible.
 */
export const useFeaturePermission = (
  feature: 'tarot' | 'horoscope' | 'buzios' | 'oracle_chat',
) => {
  const {
    featureAccess,
    isFetchingFeatureAccess,
    fetchFeatureAccess,
    canAccessTarot,
    canAccessHoroscope,
    canAccessBuzios,
    canAccessOracleChat,
    hasReachedDailyLimit,
    getRemainingUsage,
    isUnlimited,
    getPackageInfo,
    getAdditionalFeatures,
  } = useFeaturePermissionStore(
    useShallow(state => ({
      featureAccess: state.featureAccess,
      isFetchingFeatureAccess: state.isFetchingFeatureAccess,
      fetchFeatureAccess: state.fetchFeatureAccess,
      canAccessTarot: state.canAccessTarot,
      canAccessHoroscope: state.canAccessHoroscope,
      canAccessBuzios: state.canAccessBuzios,
      canAccessOracleChat: state.canAccessOracleChat,
      hasReachedDailyLimit: state.hasReachedDailyLimit,
      getRemainingUsage: state.getRemainingUsage,
      isUnlimited: state.isUnlimited,
      getPackageInfo: state.getPackageInfo,
      getAdditionalFeatures: state.getAdditionalFeatures,
    })),
  );

  const checkers = {
    tarot: canAccessTarot,
    horoscope: canAccessHoroscope,
    buzios: canAccessBuzios,
    oracle_chat: canAccessOracleChat,
  };

  const featureData = featureAccess?.[feature];

  return {
    isAllowed: checkers[feature](),
    hasReachedLimit: hasReachedDailyLimit(feature),
    remainingUsage: getRemainingUsage(feature),
    dailyLimit: featureData?.dailyLimit || 0,
    isUnlimited: isUnlimited(feature),
    usedToday: featureData?.usedToday || 0,
    isLoading: isFetchingFeatureAccess,
    refresh: () => fetchFeatureAccess(true),
    packageInfo: getPackageInfo(),
    additionalFeatures: getAdditionalFeatures(),
    // Feature-specific properties
    cardsPerReading: featureData?.cardsPerReading,
    depth: featureData?.depth,
    shellsPerReading: featureData?.shellsPerReading,
  };
};
