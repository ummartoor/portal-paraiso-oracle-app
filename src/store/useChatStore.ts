import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Interfaces ---
export interface ChatMessage {
  role: 'user_message' | 'ai_response' | 'assistant';
  content: string;
  timestamp: string;
  _id?: string;
}

export interface ChatPagination {
  current_page: number;
  total_pages: number;
  total_messages?: number;
  messages_per_page?: number;
  total_sessions?: number;
  sessions_per_page?: number;
}

export interface UserContext {
  zodiac_sign: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
}

export interface ChatPreferences {
  response_style: string;
  focus_areas: string[];
}

export interface ChatSession {
  id: string;
  session_id: string;
  title: string;
  session_type: string;
  is_active: boolean;
  message_count: number;
  created_at: string;
  last_activity: string;
  last_message?: ChatMessage;
}

export interface ActiveChatSession {
  session: ChatSession;
  messages: ChatMessage[];
  pagination: ChatPagination;
  user_context: UserContext;
  preferences: ChatPreferences;
}

export interface SendMessagePayload {
  message: string;
  session_id?: string | null;
  preferences: ChatPreferences;
}

interface ChatState {
  // State for session list
  sessions: ChatSession[] | null;
  sessionsPagination: ChatPagination | null;
  isLoadingSessions: boolean;
  isLoadingMoreSessions: boolean;
  sessionsError: string | null;
  getSessions: (page?: number) => Promise<void>;
  loadMoreSessions: () => Promise<void>;

  // State for a single active session and its history
  activeSession: ActiveChatSession | null;
  isLoadingHistory: boolean;
  historyError: string | null;
  getSessionHistory: (sessionId: string) => Promise<void>;

  // State for sending a message
  isSendingMessage: boolean;
  sendMessageError: string | null;
  sendMessage: (payload: SendMessagePayload) => Promise<boolean>;

  // State for deleting a session
  isDeletingSession: boolean;
  deleteSessionError: string | null;
  deleteSession: (sessionId: string) => Promise<boolean>;

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

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      'An unknown error occurred.'
    );
  }
  return error instanceof Error ? error.message : 'An unknown error occurred.';
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

  isDeletingSession: false,
  deleteSessionError: null,

  /**
   * Fetches chat sessions for a specific page.
   * Defaults to page 1 for initial load.
   */
  getSessions: async (page: number = 1) => {
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
        `${API_BASEURL}/oracle-chat/sessions?page=${page}`,
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
      sessionsPagination.current_page >= sessionsPagination.total_pages
    ) {
      return;
    }

    const nextPage = sessionsPagination.current_page + 1;
    await getSessions(nextPage);
  },

  /**
   * Fetches the complete message history for a specific session.
   */
  getSessionHistory: async (sessionId: string) => {
    set({ isLoadingHistory: true, historyError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const response = await axios.get(
        `${API_BASEURL}/oracle-chat/sessions/${sessionId}/history`,
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
    set({ isSendingMessage: true, sendMessageError: null });
    try {
      const token = await getAuthToken();
      const headers = { 'x-auth-token': token };
      const apiPayload = { ...payload, session_id: payload.session_id || '' };

      const response = await axios.post(
        `${API_BASEURL}/oracle-chat/send-message`,
        apiPayload,
        { headers },
      );

      if (response.data?.success) {
        const newSessionData = response.data.data as ActiveChatSession;
        const isNewSession = !payload.session_id;

        if (isNewSession) {
          set({ activeSession: newSessionData, isSendingMessage: false });
        } else {
          set(state => {
            if (!state.activeSession) return {};

            const newMessagesFromServer = newSessionData.messages;

            const combinedMessages = [
              ...state.activeSession.messages.filter(
                msg => !msg._id?.startsWith('temp_'),
              ),
              ...newMessagesFromServer,
            ];

            const updatedActiveSession: ActiveChatSession = {
              ...state.activeSession,
              session: newSessionData.session,
              messages: combinedMessages,
            };

            return {
              activeSession: updatedActiveSession,
              isSendingMessage: false,
            };
          });
        }

        if (isNewSession) {
          set(state => ({
            sessions: [newSessionData.session, ...(state.sessions || [])],
          }));
        } else {
          set(state => ({
            sessions: (state.sessions || []).map(s =>
              s.session_id === newSessionData.session.session_id
                ? {
                    ...s,
                    ...newSessionData.session,
                    last_message: newSessionData.messages.slice(-1)[0],
                  }
                : s,
            ),
          }));
        }
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to send message.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      set({ sendMessageError: errorMessage, isSendingMessage: false });
      Alert.alert('Error', errorMessage);
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
}));
