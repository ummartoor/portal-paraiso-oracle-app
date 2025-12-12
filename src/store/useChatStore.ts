import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimerData } from '../utils/timerUtils';
import {
  parseApiError,
  getErrorMessageWithContext,
  isDailyLimitError,
} from '../utils/apiErrorHandler';

// --- Interfaces matching API v2.0 documentation ---
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  message_id?: string;
}

export interface ChatPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ChatPreferences {
  tone?: string;
  length?: string;
  [key: string]: any;
}

export interface ChatUsage {
  questions_used: number;
  questions_limit: number;
  questions_remaining: number;
  timer?: TimerData;
  show_timer?: boolean;
}

export interface ChatSession {
  session_id: string;
  title: string;
  is_active: boolean;
  created_at: string;
  last_message_at?: string;
  message_count?: number;
}

export interface ActiveChatSession {
  session: ChatSession;
  messages: ChatMessage[];
  pagination: ChatPagination;
}

export interface SendMessagePayload {
  message: string;
  session_id?: string | null;
  preferences?: ChatPreferences;
}

export interface SendMessageResponse {
  session_id: string;
  message_id: string;
  response: string;
  usage?: ChatUsage;
}

export interface DailyWisdomCard {
  _id: string;
  card_name: {
    en: string;
    pt?: string;
  };
  reading: string;
  card_date: string;
  is_used: boolean;
}

interface ChatState {
  // State for session list
  sessions: ChatSession[] | null;
  sessionsPagination: ChatPagination | null;
  isLoadingSessions: boolean;
  isLoadingMoreSessions: boolean;
  sessionsError: string | null;
  getSessions: (
    page?: number,
    limit?: number,
    active_only?: boolean,
  ) => Promise<void>;
  loadMoreSessions: () => Promise<void>;

  // State for a single active session and its history
  activeSession: ActiveChatSession | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  getSessionHistory: (
    sessionId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;

  // State for sending a message
  isSendingMessage: boolean;
  sendMessageError: string | null;
  sendMessageErrorDetails: {
    isPremiumRequired: boolean;
    timer: TimerData | null;
    showTimer: boolean;
  } | null;
  sendMessage: (payload: SendMessagePayload) => Promise<boolean>;

  // State for deleting a session
  isDeletingSession: boolean;
  deleteSessionError: string | null;
  deleteSession: (sessionId: string) => Promise<boolean>;

  // State for daily wisdom card
  dailyWisdomCard: DailyWisdomCard | null;
  isLoadingWisdomCard: boolean;
  wisdomCardError: string | null;
  getDailyWisdomCard: () => Promise<void>;

  // Utility actions
  createNewChat: () => void;
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem('x-auth-token');
  if (!token) {
    throw new Error('Authentication token not found.');
  }
  return token;
};

// Helper function to extract error message (kept for backward compatibility)
const getErrorMessage = (error: unknown): string => {
  const errorInfo = getErrorMessageWithContext(error);
  return errorInfo.message;
};

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  sessions: null,
  sessionsPagination: null,
  isLoadingSessions: false,
  isLoadingMoreSessions: false,
  sessionsError: null,

  activeSession: null,
  isLoadingHistory: false,
  historyError: null,

  isSendingMessage: false,
  sendMessageError: null,
  sendMessageErrorDetails: null,

  isDeletingSession: false,
  deleteSessionError: null,

  dailyWisdomCard: null,
  isLoadingWisdomCard: false,
  wisdomCardError: null,

  /**
   * Fetches chat sessions for a specific page.
   * Defaults to page 1 for initial load.
   */
  getSessions: async (
    page: number = 1,
    limit: number = 10,
    active_only: boolean = true,
  ) => {
    const isLoadingFirstPage = page === 1;
    set({
      [isLoadingFirstPage ? 'isLoadingSessions' : 'isLoadingMoreSessions']:
        true,
      sessionsError: null,
    });

    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const response = await axios.get(
        `${API_BASEURL}/oracle-chat/sessions?page=${page}&limit=${limit}&active_only=${active_only}`,
        { headers },
      );

      if (response.data?.success) {
        const newSessions = response.data.data.sessions as ChatSession[];
        const pagination = response.data.data.pagination as ChatPagination;

        set(state => ({
          sessions:
            page === 1
              ? newSessions
              : [...(state.sessions || []), ...newSessions],
          sessionsPagination: pagination,
          isLoadingSessions: false,
          isLoadingMoreSessions: false,
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch sessions.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({
        sessionsError: errorMessage,
        isLoadingSessions: false,
        isLoadingMoreSessions: false,
      });
      // Only show alert on initial load failure, not "load more"
      if (isLoadingFirstPage) {
        Alert.alert('Error', errorMessage);
      }
    }
  },

  /**
   * Loads the next page of sessions if available.
   */
  loadMoreSessions: async () => {
    const {
      isLoadingMoreSessions,
      isLoadingSessions,
      sessionsPagination,
      getSessions,
    } = get();

    // Prevent fetching if already loading
    if (isLoadingMoreSessions || isLoadingSessions) return;

    // Prevent fetching if no pagination data or already on the last page
    if (
      !sessionsPagination ||
      sessionsPagination.page >= sessionsPagination.pages
    ) {
      return;
    }

    const nextPage = sessionsPagination.page + 1;
    await getSessions(nextPage);
  },

  /**
   * Fetches the complete message history for a specific session.
   */
  getSessionHistory: async (
    sessionId: string,
    page: number = 1,
    limit: number = 50,
  ) => {
    set({ isLoadingHistory: true, historyError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const response = await axios.get(
        `${API_BASEURL}/oracle-chat/sessions/${sessionId}/history?page=${page}&limit=${limit}`,
        { headers },
      );

      if (response.data?.success) {
        set({
          activeSession: response.data.data as ActiveChatSession,
          isLoadingHistory: false,
        });
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch chat history.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ historyError: errorMessage, isLoadingHistory: false });
      Alert.alert('Error', errorMessage);
    }
  },

  /**
   * Sends a new message and updates the session.
   */
  sendMessage: async (payload: SendMessagePayload) => {
    set({
      isSendingMessage: true,
      sendMessageError: null,
      sendMessageErrorDetails: null,
    });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const apiPayload = {
        message: payload.message,
        session_id: payload.session_id || undefined,
        preferences: payload.preferences || {},
      };

      const response = await axios.post(
        `${API_BASEURL}/oracle-chat/send-message`,
        apiPayload,
        { headers },
      );

      if (response.data?.success) {
        const data = response.data.data as SendMessageResponse;
        const isNewSession = !payload.session_id;

        // Update active session with new message
        if (isNewSession) {
          // For new session, we need to fetch the session history
          // or construct it from the response
          const newSession: ChatSession = {
            session_id: data.session_id,
            title: payload.message.substring(0, 50),
            is_active: true,
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
            message_count: 1,
          };

          const newMessages: ChatMessage[] = [
            {
              role: 'user',
              content: payload.message,
              timestamp: new Date().toISOString(),
            },
            {
              role: 'assistant',
              content: data.response,
              timestamp: new Date().toISOString(),
              message_id: data.message_id,
            },
          ];

          set({
            activeSession: {
              session: newSession,
              messages: newMessages,
              pagination: {
                page: 1,
                limit: 50,
                total: 2,
                pages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
            isSendingMessage: false,
            sessions: [newSession, ...(get().sessions || [])],
          });
        } else {
          // Update existing session
          set(state => {
            if (!state.activeSession) return { isSendingMessage: false };

            const newUserMessage: ChatMessage = {
              role: 'user',
              content: payload.message,
              timestamp: new Date().toISOString(),
            };

            const newAssistantMessage: ChatMessage = {
              role: 'assistant',
              content: data.response,
              timestamp: new Date().toISOString(),
              message_id: data.message_id,
            };

            return {
              activeSession: {
                ...state.activeSession,
                messages: [
                  ...state.activeSession.messages,
                  newUserMessage,
                  newAssistantMessage,
                ],
              },
              isSendingMessage: false,
            };
          });
        }
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to send message.');
      }
    } catch (error: unknown) {
      const errorInfo = getErrorMessageWithContext(error);
      set({
        sendMessageError: errorInfo.message,
        sendMessageErrorDetails: {
          isPremiumRequired: errorInfo.isPremiumRequired,
          timer: errorInfo.timer,
          showTimer: errorInfo.showTimer,
        },
        isSendingMessage: false,
      });
      // Don't auto-show Alert - let component handle based on error type
      return false;
    }
  },

  /**
   * Deletes a chat session.
   */
  deleteSession: async (sessionId: string) => {
    set({ isDeletingSession: true, deleteSessionError: null });
    const originalSessions = get().sessions;

    // Optimistically remove the session from the UI
    set(state => ({
      sessions: (state.sessions || []).filter(s => s.session_id !== sessionId),
    }));

    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const response = await axios.delete(
        `${API_BASEURL}/oracle-chat/sessions/${sessionId}`,
        { headers },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data.message || 'Failed to delete session on the server.',
        );
      }

      // If the active session was deleted, clear it.
      if (get().activeSession?.session?.session_id === sessionId) {
        set({ activeSession: null });
      }

      set({ isDeletingSession: false });
      return true;
    } catch (error: unknown) {
      // If the API call fails, revert the change in the UI
      set({ sessions: originalSessions });
      const errorMessage = getErrorMessage(error);
      set({ deleteSessionError: errorMessage, isDeletingSession: false });
      Alert.alert('Error', `Could not delete session: ${errorMessage}`);
      return false;
    }
  },

  /**
   * Creates a new chat session.
   */
  createNewChat: () => {
    set({ activeSession: null, historyError: null });
  },

  /**
   * Fetches the daily wisdom card.
   */
  getDailyWisdomCard: async () => {
    set({ isLoadingWisdomCard: true, wisdomCardError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const response = await axios.get(
        `${API_BASEURL}/oracle-chat/daily-wisdom-card`,
        { headers },
      );

      if (response.data?.success && response.data?.data?.card) {
        set({
          dailyWisdomCard: response.data.data.card as DailyWisdomCard,
          isLoadingWisdomCard: false,
        });
      } else {
        throw new Error(
          response.data?.message || 'Failed to fetch daily wisdom card.',
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ wisdomCardError: errorMessage, isLoadingWisdomCard: false });
      // Don't show alert - let component handle it
    }
  },
}));
