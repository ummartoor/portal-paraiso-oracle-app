import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import axios from 'axios';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerData } from '../utils/timerUtils';

// --- TypeScript Interfaces matching API v2.0 documentation ---

export interface LocalizedString {
  en: string;
  pt?: string;
  [key: string]: string | undefined;
}

export interface TarotFeatureAccess {
  cards_per_reading: number;
  cards_min: number;
  cards_max: number;
  daily_limit: number;
  used_today: number;
  remaining: number;
  unlimited: boolean;
  show_timer: boolean;
}

export interface BuziosFeatureAccess {
  shells_per_reading: number;
  daily_limit: number;
  used_today: number;
  remaining: number;
  unlimited: boolean;
  show_timer: boolean;
}

export interface AstrologyFeatureAccess {
  depth: string;
  daily_limit: number;
  used_today: number;
  remaining: number;
  unlimited: boolean;
  show_timer: boolean;
}

export interface ChatFeatureAccess {
  daily_limit: number;
  unlimited: boolean;
  used_today: number;
  remaining: number;
  show_timer: boolean;
}

export interface PackageInfo {
  name: LocalizedString;
  type: string;
  tier: number;
}

export interface Features {
  can_save_readings: boolean;
  audio_narration: boolean;
  reading_history_days: number;
  ad_free: boolean;
  show_ads: boolean;
}

export interface Experience {
  ad_free: boolean;
  show_ads: boolean;
  vip_badge: boolean;
  early_access_features: boolean;
  priority_support: boolean;
}

export interface FeatureAccessData {
  package: PackageInfo;
  readings: {
    tarot: TarotFeatureAccess;
    buzios: BuziosFeatureAccess;
    astrology: AstrologyFeatureAccess;
    chat: ChatFeatureAccess;
  };
  features: Features;
  experience: Experience;
  next_reset: string;
  timer: TimerData;
  show_timer: boolean;
}

export interface UsageStats {
  tarot_readings: number;
  buzios_readings: number;
  astrology_readings: number;
  chat_questions: number;
  games_played: number;
  last_tarot_reading: string | null;
  last_buzios_reading: string | null;
  last_astrology_reading: string | null;
  last_chat_question: string | null;
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
  canAccessAstrology: () => boolean;
  canAccessBuzios: () => boolean;
  canAccessOracleChat: () => boolean;
  hasReachedDailyLimit: (
    feature: 'tarot' | 'astrology' | 'buzios' | 'chat',
  ) => boolean;
  getRemainingUsage: (
    feature: 'tarot' | 'astrology' | 'buzios' | 'chat',
  ) => number;

  // Additional getters
  getPackageInfo: () => PackageInfo | null;
  getFeatures: () => Features | null;
  getExperience: () => Experience | null;
  getTimer: () => TimerData | null;
  isUnlimited: (feature: 'tarot' | 'astrology' | 'buzios' | 'chat') => boolean;
  getCardLimits: () => { min: number; max: number } | null;
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

          console.log('🔐 [API Response] GET /user/feature-access:', {
            url: `${API_BASEURL}/user/feature-access`,
            status: response.status,
            data: response.data,
          });

          if (response.data?.success && response.data?.data) {
            const data = response.data.data;
            const featureAccess: FeatureAccessData = {
              package: data.package,
              readings: {
                tarot: data.readings?.tarot || {
                  cards_per_reading: 3,
                  cards_min: 1,
                  cards_max: 3,
                  daily_limit: 1,
                  used_today: 0,
                  remaining: 1,
                  unlimited: false,
                  show_timer: true,
                },
                buzios: data.readings?.buzios || {
                  shells_per_reading: 16,
                  daily_limit: 1,
                  used_today: 0,
                  remaining: 1,
                  unlimited: false,
                  show_timer: true,
                },
                astrology: data.readings?.astrology || {
                  depth: 'basic',
                  daily_limit: 0,
                  used_today: 0,
                  remaining: 0,
                  unlimited: false,
                  show_timer: false,
                },
                chat: data.readings?.chat || {
                  daily_limit: 5,
                  unlimited: false,
                  used_today: 0,
                  remaining: 5,
                  show_timer: true,
                },
              },
              features: data.features,
              experience: data.experience,
              next_reset: data.next_reset,
              timer: data.timer,
              show_timer: data.show_timer ?? true,
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
              buzios_readings: response.data.data.buzios_readings || 0,
              astrology_readings: response.data.data.astrology_readings || 0,
              chat_questions: response.data.data.chat_questions || 0,
              games_played: response.data.data.games_played || 0,
              last_tarot_reading: response.data.data.last_tarot_reading || null,
              last_buzios_reading:
                response.data.data.last_buzios_reading || null,
              last_astrology_reading:
                response.data.data.last_astrology_reading || null,
              last_chat_question: response.data.data.last_chat_question || null,
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
      const tarot = featureAccess?.readings?.tarot;
      return tarot ? tarot.daily_limit > 0 || tarot.unlimited : false;
    },

    /**
     * Checks if user can access Astrology feature.
     */
    canAccessAstrology: (): boolean => {
      const { featureAccess } = get();
      const astrology = featureAccess?.readings?.astrology;
      return astrology
        ? astrology.daily_limit > 0 || astrology.unlimited
        : false;
    },

    /**
     * Checks if user can access Búzios feature.
     */
    canAccessBuzios: (): boolean => {
      const { featureAccess } = get();
      const buzios = featureAccess?.readings?.buzios;
      return buzios ? buzios.daily_limit > 0 || buzios.unlimited : false;
    },

    /**
     * Checks if user can access Oracle Chat feature.
     */
    canAccessOracleChat: (): boolean => {
      const { featureAccess } = get();
      const chat = featureAccess?.readings?.chat;
      return chat ? chat.daily_limit > 0 || chat.unlimited : false;
    },

    /**
     * Checks if user has reached daily limit for a feature.
     */
    hasReachedDailyLimit: (
      featureName: 'tarot' | 'astrology' | 'buzios' | 'chat',
    ): boolean => {
      const { featureAccess } = get();
      const readings = featureAccess?.readings;
      if (!readings) return true;

      const featureData = {
        tarot: readings.tarot,
        astrology: readings.astrology,
        buzios: readings.buzios,
        chat: readings.chat,
      }[featureName];

      if (!featureData) return true;

      // If unlimited, never reached limit
      if (featureData.unlimited === true) return false;

      // Check remaining count
      return featureData.remaining <= 0;
    },

    /**
     * Gets remaining usage count for a feature.
     */
    getRemainingUsage: (
      featureName: 'tarot' | 'astrology' | 'buzios' | 'chat',
    ): number => {
      const { featureAccess } = get();
      const readings = featureAccess?.readings;
      if (!readings) return 0;

      const featureData = {
        tarot: readings.tarot,
        astrology: readings.astrology,
        buzios: readings.buzios,
        chat: readings.chat,
      }[featureName];

      if (!featureData) return 0;

      // If unlimited, return a large number
      if (featureData.unlimited === true) return 9999;

      return Math.max(0, featureData.remaining || 0);
    },

    // Get package information
    getPackageInfo: (): PackageInfo | null => {
      const { featureAccess } = get();
      return featureAccess?.package || null;
    },

    // Get features
    getFeatures: (): Features | null => {
      const { featureAccess } = get();
      return featureAccess?.features || null;
    },

    // Get experience
    getExperience: (): Experience | null => {
      const { featureAccess } = get();
      return featureAccess?.experience || null;
    },

    // Get timer
    getTimer: (): TimerData | null => {
      const { featureAccess } = get();
      return featureAccess?.timer || null;
    },

    // Check if feature has unlimited access
    isUnlimited: (
      feature: 'tarot' | 'astrology' | 'buzios' | 'chat',
    ): boolean => {
      const { featureAccess } = get();
      const readings = featureAccess?.readings;
      if (!readings) return false;

      const featureData = {
        tarot: readings.tarot,
        astrology: readings.astrology,
        buzios: readings.buzios,
        chat: readings.chat,
      }[feature];

      return featureData?.unlimited === true;
    },

    // Get card limits for tarot
    getCardLimits: (): { min: number; max: number } | null => {
      const { featureAccess } = get();
      const tarot = featureAccess?.readings?.tarot;
      if (!tarot) return null;

      return {
        min: tarot.cards_min,
        max: tarot.cards_max,
      };
    },
  }),
);

/**
 * Hook to check feature permissions with automatic fetching.
 * Use this in components to check if a feature is accessible.
 */
export const useFeaturePermission = (
  feature: 'tarot' | 'astrology' | 'buzios' | 'chat' | 'horoscope',
) => {
  const {
    featureAccess,
    isFetchingFeatureAccess,
    fetchFeatureAccess,
    canAccessTarot,
    canAccessAstrology,
    canAccessBuzios,
    canAccessOracleChat,
    hasReachedDailyLimit,
    getRemainingUsage,
    isUnlimited,
    getPackageInfo,
    getFeatures,
    getExperience,
    getTimer,
    getCardLimits,
  } = useFeaturePermissionStore(
    useShallow(state => ({
      featureAccess: state.featureAccess,
      isFetchingFeatureAccess: state.isFetchingFeatureAccess,
      fetchFeatureAccess: state.fetchFeatureAccess,
      canAccessTarot: state.canAccessTarot,
      canAccessAstrology: state.canAccessAstrology,
      canAccessBuzios: state.canAccessBuzios,
      canAccessOracleChat: state.canAccessOracleChat,
      hasReachedDailyLimit: state.hasReachedDailyLimit,
      getRemainingUsage: state.getRemainingUsage,
      isUnlimited: state.isUnlimited,
      getPackageInfo: state.getPackageInfo,
      getFeatures: state.getFeatures,
      getExperience: state.getExperience,
      getTimer: state.getTimer,
      getCardLimits: state.getCardLimits,
    })),
  );

  // Normalize feature name (backward compatibility: 'horoscope' -> 'astrology')
  const normalizedFeature: 'tarot' | 'astrology' | 'buzios' | 'chat' =
    feature === 'horoscope' ? 'astrology' : feature;

  // Validate feature parameter
  const validFeatures = ['tarot', 'astrology', 'buzios', 'chat'] as const;
  if (!validFeatures.includes(normalizedFeature)) {
    console.error(
      `Invalid feature: ${feature} (normalized: ${normalizedFeature}). Must be one of: ${validFeatures.join(
        ', ',
      )}`,
    );
  }

  const checkers: Record<
    'tarot' | 'astrology' | 'buzios' | 'chat',
    () => boolean
  > = {
    tarot: canAccessTarot,
    astrology: canAccessAstrology,
    buzios: canAccessBuzios,
    chat: canAccessOracleChat,
  };

  const readings = featureAccess?.readings;
  const featureData = readings ? readings[normalizedFeature] : null;

  // Safety check: ensure checker function exists
  const checker = checkers[normalizedFeature];
  if (!checker || typeof checker !== 'function') {
    console.warn(
      `Feature permission checker not found for feature: ${feature} (normalized: ${normalizedFeature})`,
    );
    return {
      isAllowed: false,
      hasReachedLimit: true,
      remainingUsage: 0,
      dailyLimit: 0,
      isUnlimited: false,
      usedToday: 0,
      isLoading: isFetchingFeatureAccess,
      refresh: () => fetchFeatureAccess(true),
      packageInfo: getPackageInfo(),
      features: getFeatures(),
      experience: getExperience(),
      timer: getTimer(),
      showTimer: featureAccess?.show_timer ?? false,
      cardsPerReading: undefined,
      cardsMin: undefined,
      cardsMax: undefined,
      cardLimits: null,
      depth: undefined,
      shellsPerReading: undefined,
    };
  }

  return {
    isAllowed: checker(),
    hasReachedLimit: hasReachedDailyLimit(normalizedFeature),
    remainingUsage: getRemainingUsage(normalizedFeature),
    dailyLimit: featureData?.daily_limit || 0,
    isUnlimited: isUnlimited(normalizedFeature),
    usedToday: featureData?.used_today || 0,
    isLoading: isFetchingFeatureAccess,
    refresh: () => fetchFeatureAccess(true),
    packageInfo: getPackageInfo(),
    features: getFeatures(),
    experience: getExperience(),
    timer: getTimer(),
    showTimer: featureAccess?.show_timer ?? false,
    // Feature-specific properties (only for tarot)
    cardsPerReading:
      normalizedFeature === 'tarot'
        ? (featureData as TarotFeatureAccess)?.cards_per_reading
        : undefined,
    cardsMin:
      normalizedFeature === 'tarot'
        ? (featureData as TarotFeatureAccess)?.cards_min
        : undefined,
    cardsMax:
      normalizedFeature === 'tarot'
        ? (featureData as TarotFeatureAccess)?.cards_max
        : undefined,
    cardLimits: normalizedFeature === 'tarot' ? getCardLimits() : null,
    depth:
      normalizedFeature === 'astrology'
        ? (featureData as AstrologyFeatureAccess)?.depth
        : undefined,
    shellsPerReading:
      normalizedFeature === 'buzios'
        ? (featureData as BuziosFeatureAccess)?.shells_per_reading
        : undefined,
  };
};
