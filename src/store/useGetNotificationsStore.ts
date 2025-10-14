// import { create } from 'zustand';
// import axios from 'axios';
// import { Alert } from 'react-native';
// import { API_BASEURL } from '@env';
// import AsyncStorage from '@react-native-async-storage/async-storage';



// // New interface for the general notification structure
// export interface NotificationItem {
//   _id: string;
//   user: {
//     _id: string;
//     name: string;
//     email: string;
//   };
//   type: 'general' | 'daily_wisdom_card' | 'daily_ritual_tip';
//   title: string;
//   message: string;
//   data: {
//     [key: string]: any; // Flexible data object
//   };
//   is_read: boolean; // Updated from isRead
//   read_at: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface NotificationPagination {
//   currentPage: number;
//   totalPages: number;
//   totalCount: number;
//   limit: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

// // --- Interfaces for Notification Details (These remain the same) ---

// export interface WisdomCardDetailData {
//     wisdomCard: {
//         _id: string;
//         card: {
//             card_name: string;
//             card_meaning: string;
//             card_description: string;
//             card_image: { url: string; };
//         };
//         reading: string;
//         card_date: string;
//     };
// }

// export interface RitualTipDetailData {
//     ritualTip: {
//         _id: string;
//         ritual_tip: {
//             ritual_name: string;
//             ritual_description: string;
//             ritual_image: { url: string; };
//         };
//         ai_response: string;
//         tip_date: string;
//     };
// }


// // =================================================================
// // ZUSTAND STORE
// // =================================================================

// interface NotificationState {
//   // --- States for notification list ---
//   notifications: NotificationItem[] | null;
//   pagination: NotificationPagination | null;
//   isLoading: boolean;
//   error: string | null;
//   getNotifications: (page?: number, limit?: number) => Promise<void>;

//   // --- States for unread count ---
//   unreadCount: number;
//   isLoadingCount: boolean;
//   getUnreadCount: () => Promise<void>;

//   // --- States for general actions ---
//   isUpdating: boolean;
//   markNotificationAsRead: (notificationId: string) => Promise<boolean>;
//   markAllNotificationsAsRead: () => Promise<boolean>;
//   deleteNotification: (notificationId: string) => Promise<boolean>;
  
//   // --- States for fetching notification details ---
//   wisdomCardDetail: WisdomCardDetailData | null;
//   isLoadingWisdomCard: boolean;
//   getWisdomCardNotification: () => Promise<WisdomCardDetailData | null>;

//   ritualTipDetail: RitualTipDetailData | null;
//   isLoadingRitualTip: boolean;
//   getRitualTipNotification: () => Promise<RitualTipDetailData | null>;
// }

// export const useGetNotificationsStore = create<NotificationState>((set, get) => ({
//   // --- INITIAL STATE ---
//   notifications: null,
//   pagination: null,
//   isLoading: false,
//   error: null,
//   unreadCount: 0,
//   isLoadingCount: false,
//   isUpdating: false,
//   wisdomCardDetail: null,
//   isLoadingWisdomCard: false,
//   ritualTipDetail: null,
//   isLoadingRitualTip: false,

//   // =================================================================
//   // ACTIONS
//   // =================================================================

//   getNotifications: async (page = 1, limit = 20) => {
//     set({ isLoading: true, error: null });
//     try {
//       const token = await AsyncStorage.getItem('x-auth-token');
//       if (!token) throw new Error('Authentication token not found.');
//       const headers = { 'x-auth-token': token };

//       const response = await axios.get(
//         `${API_BASEURL}/notifications/get-user-all-notifications?page=${page}&limit=${limit}`,
//         { headers }
//       );

//       if (response.data?.success) {
//         set({
//           notifications: response.data.data.notifications as NotificationItem[],
//           pagination: response.data.data.pagination as NotificationPagination,
//           isLoading: false,
//         });
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch notifications.');
//       }
//     } catch (error: any) {
//       const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
//       set({ error: errorMessage, isLoading: false });
//       Alert.alert('Error', errorMessage);
//     }
//   },

//   getUnreadCount: async () => {
//     set({ isLoadingCount: true });
//     try {
//         const token = await AsyncStorage.getItem('x-auth-token');
//         if (!token) throw new Error('Authentication token not found.');
//         const headers = { 'x-auth-token': token };

//         const response = await axios.get(`${API_BASEURL}/notifications/get-unread-count`, { headers });

//         if (response.data?.success) {
//             set({ unreadCount: response.data.data.unreadCount, isLoadingCount: false });
//         } else {
//             throw new Error(response.data.message || 'Failed to fetch unread count.');
//         }
//     } catch (error: any) {
//         console.error("Failed to fetch unread count:", error.message);
//         set({ isLoadingCount: false });
//     }
//   },

//   markNotificationAsRead: async (notificationId: string) => {
//     set({ isUpdating: true });
//     set(state => ({
//         notifications: (state.notifications || []).map(n => n._id === notificationId ? { ...n, is_read: true } : n),
//         unreadCount: Math.max(0, state.unreadCount - 1)
//     }));
//     try {
//         const token = await AsyncStorage.getItem('x-auth-token');
//         if (!token) throw new Error('Authentication token not found.');
//         const headers = { 'x-auth-token': token };
//         const response = await axios.put(`${API_BASEURL}/notifications/mark-notification-as-read/${notificationId}`, {}, { headers });
//         if (response.data?.success) {
//             set({ isUpdating: false });
//             return true;
//         } else {
//             throw new Error(response.data.message || 'Failed to mark as read.');
//         }
//     } catch (error: any) {
//         console.error("Mark as read failed:", error.message);
//         set({ isUpdating: false });
//         return false;
//     }
//   },

//   markAllNotificationsAsRead: async () => {
//       set({ isUpdating: true });
//       set(state => ({
//           notifications: (state.notifications || []).map(n => ({ ...n, is_read: true })),
//           unreadCount: 0
//       }));
//       try {
//           const token = await AsyncStorage.getItem('x-auth-token');
//           if (!token) throw new Error('Authentication token not found.');
//           const headers = { 'x-auth-token': token };
//           const response = await axios.put(`${API_BASEURL}/notifications/mark-all-notifications-as-read`, {}, { headers });
//           if (response.data?.success) {
//               set({ isUpdating: false });
//               return true;
//           } else {
//               throw new Error(response.data.message || 'Failed to mark all as read.');
//           }
//       } catch (error: any) {
//           console.error("Mark all as read failed:", error.message);
//           set({ isUpdating: false });
//           return false;
//       }
//   },

//   deleteNotification: async (notificationId: string) => {
//     set({ isUpdating: true });
//     const originalNotifications = get().notifications;
//     set(state => ({
//         notifications: (state.notifications || []).filter(n => n._id !== notificationId)
//     }));
//     try {
//         const token = await AsyncStorage.getItem('x-auth-token');
//         if (!token) throw new Error('Authentication token not found.');
//         const headers = { 'x-auth-token': token };
//         const response = await axios.delete(`${API_BASEURL}/notifications/delete-notification/${notificationId}`, { headers });
//         if (response.data?.success) {
//             set({ isUpdating: false });
//             get().getUnreadCount();
//             return true;
//         } else {
//             throw new Error(response.data.message || 'Failed to delete notification.');
//         }
//     } catch (error: any) {
//         console.error("Delete notification failed:", error.message);
//         set({ notifications: originalNotifications, isUpdating: false });
//         Alert.alert("Error", "Could not delete the notification.");
//         return false;
//     }
//   },
  
//   getWisdomCardNotification: async () => {
//       set({ isLoadingWisdomCard: true });
//       try {
//           const token = await AsyncStorage.getItem('x-auth-token');
//           if (!token) throw new Error('Authentication token not found.');
//           const headers = { 'x-auth-token': token };
//           const response = await axios.get(`${API_BASEURL}/notifications/get-todays-wisdom-card`, { headers });
//           if (response.data?.success) {
//               const data = response.data.data as WisdomCardDetailData;
//               set({ wisdomCardDetail: data, isLoadingWisdomCard: false });
//               return data;
//           } else {
//               throw new Error(response.data.message || 'Failed to fetch wisdom card notification.');
//           }
//       } catch (error: any) {
//           const errorMessage = error.response?.data?.message || error.message;
//           set({ isLoadingWisdomCard: false });
//           Alert.alert('Error', errorMessage);
//           return null;
//       }
//   },

//   getRitualTipNotification: async () => {
//     set({ isLoadingRitualTip: true });
//     try {
//         const token = await AsyncStorage.getItem('x-auth-token');
//         if (!token) throw new Error('Authentication token not found.');
//         const headers = { 'x-auth-token': token };
//         const response = await axios.get(`${API_BASEURL}/notifications/get-todays-ritual-tip`, { headers });
//         if (response.data?.success) {
//             const data = response.data.data as RitualTipDetailData;
//             set({ ritualTipDetail: data, isLoadingRitualTip: false });
//             return data;
//         } else {
//             throw new Error(response.data.message || 'Failed to fetch ritual tip notification.');
//         }
//     } catch (error: any) {
//         const errorMessage = error.response?.data?.message || error.message;
//         set({ isLoadingRitualTip: false });
//         Alert.alert('Error', errorMessage);
//         return null;
//     }
//   },
// }));




import { create } from 'zustand';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- INTERFACES (No changes here, they are correct) ---
export interface NotificationItem {
  _id: string;
  user: { _id: string; name: string; email: string; };
  type: 'general' | 'daily_wisdom_card' | 'daily_ritual_tip';
  title: string;
  message: string;
  data: { [key: string]: any; };
  is_read: boolean;
  read_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface WisdomCardDetailData {
    wisdomCard: {
        _id: string;
        card: {
            card_name: string;
            card_image: { url: string; };
        };
        reading: string;
        card_date: string;
    };
}

export interface RitualTipDetailData {
    ritualTip: {
        _id: string;
        ritual_tip: {
            ritual_name: string;
            ritual_image: { url: string; };
        };
        ai_response: string;
        tip_date: string;
    };
}

// --- NEW: Interface for Notification Settings ---
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  daily_wisdom_cards: boolean;
  ritual_tips: boolean;
}

// =================================================================
// ZUSTAND STORE
// =================================================================

interface NotificationState {
  notifications: NotificationItem[]; // Changed to non-nullable for easier append
  pagination: NotificationPagination | null;
  isLoading: boolean;
  isLoadingMore: boolean; // For footer loading indicator
  error: string | null;
  getNotifications: (page?: number, limit?: number) => Promise<void>;
  
  unreadCount: number;
  isLoadingCount: boolean;
  getUnreadCount: () => Promise<void>;
  
  isUpdating: boolean;
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  markAllNotificationsAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  
  wisdomCardDetail: WisdomCardDetailData | null;
  isLoadingWisdomCard: boolean;
  getWisdomCardNotification: () => Promise<WisdomCardDetailData | null>;
  
  ritualTipDetail: RitualTipDetailData | null;
  isLoadingRitualTip: boolean;
  getRitualTipNotification: () => Promise<RitualTipDetailData | null>;


  // for Notification settings ---
  notificationSettings: NotificationSettings | null;
  isUpdatingSettings: boolean;
  settingsError: string | null;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<boolean>;
}

export const useGetNotificationsStore = create<NotificationState>((set, get) => ({
  // --- INITIAL STATE ---
  notifications: [], // Initialize as an empty array
  pagination: null,
  isLoading: false,
  isLoadingMore: false, // New state
  error: null,
  unreadCount: 0,
  isLoadingCount: false,
  isUpdating: false,
  wisdomCardDetail: null,
  isLoadingWisdomCard: false,
  ritualTipDetail: null,
  isLoadingRitualTip: false,


    notificationSettings: null,
  isUpdatingSettings: false,
  settingsError: null,
  // =================================================================
  // ACTIONS
  // =================================================================

  /**
   * --- UPDATED FOR PAGINATION ---
   * Fetches notifications. If page is 1, it replaces the list. 
   * For subsequent pages, it appends to the list.
   */
  getNotifications: async (page = 1, limit = 20) => {
    // Differentiate between initial load and loading more
    if (page === 1) {
        set({ isLoading: true });
    } else {
        set({ isLoadingMore: true });
    }
    set({ error: null });

    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');
      const headers = { 'x-auth-token': token };

      const response = await axios.get(
        `${API_BASEURL}/notifications/get-user-all-notifications?page=${page}&limit=${limit}`,
        { headers }
      );

      if (response.data?.success) {
        const newNotifications = response.data.data.notifications as NotificationItem[];
        const paginationInfo = response.data.data.pagination as NotificationPagination;

        set(state => ({
           
            notifications: page === 1 ? newNotifications : [...state.notifications, ...newNotifications],
            pagination: paginationInfo,
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      set({ error: errorMessage });
      Alert.alert('Error', errorMessage);
    } finally {
        set({ isLoading: false, isLoadingMore: false });
    }
  },

  getUnreadCount: async () => {

    set({ isLoadingCount: true });
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');
        const headers = { 'x-auth-token': token };
        const response = await axios.get(`${API_BASEURL}/notifications/get-unread-count`, { headers });
        if (response.data?.success) {
            set({ unreadCount: response.data.data.unreadCount, isLoadingCount: false });
        } else {
            throw new Error(response.data.message || 'Failed to fetch unread count.');
        }
    } catch (error: any) {
        console.error("Failed to fetch unread count:", error.message);
        set({ isLoadingCount: false });
    }
  },

  markNotificationAsRead: async (notificationId: string) => {

    set(state => ({
        notifications: state.notifications.map(n => n._id === notificationId ? { ...n, is_read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
    }));
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');
        const headers = { 'x-auth-token': token };
        await axios.put(`${API_BASEURL}/notifications/mark-notification-as-read/${notificationId}`, {}, { headers });
        return true;
    } catch (error: any) {
        console.error("Mark as read failed:", error.message);
        return false;
    }
  },

  markAllNotificationsAsRead: async () => {
 
      set(state => ({
          notifications: state.notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0
      }));
      try {
          const token = await AsyncStorage.getItem('x-auth-token');
          if (!token) throw new Error('Authentication token not found.');
          const headers = { 'x-auth-token': token };
          await axios.put(`${API_BASEURL}/notifications/mark-all-notifications-as-read`, {}, { headers });
          return true;
      } catch (error: any) {
          console.error("Mark all as read failed:", error.message);
          return false;
      }
  },

  deleteNotification: async (notificationId: string) => {

    set(state => ({
        notifications: state.notifications.filter(n => n._id !== notificationId)
    }));
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');
        const headers = { 'x-auth-token': token };
        await axios.delete(`${API_BASEURL}/notifications/delete-notification/${notificationId}`, { headers });
        get().getUnreadCount();
        return true;
    } catch (error: any) {
        console.error("Delete notification failed:", error.message);
        Alert.alert("Error", "Could not delete the notification.");
        get().getNotifications(); // Refetch to restore the original list
        return false;
    }
  },
  
  getWisdomCardNotification: async () => {

      set({ isLoadingWisdomCard: true });
      try {
          const token = await AsyncStorage.getItem('x-auth-token');
          if (!token) throw new Error('Authentication token not found.');
          const headers = { 'x-auth-token': token };
          const response = await axios.get(`${API_BASEURL}/notifications/get-todays-wisdom-card`, { headers });
          if (response.data?.success) {
              const data = response.data.data as WisdomCardDetailData;
              set({ wisdomCardDetail: data, isLoadingWisdomCard: false });
              return data;
          } else { throw new Error(response.data.message); }
      } catch (error: any) {
          set({ isLoadingWisdomCard: false });
          Alert.alert('Error', error.message);
          return null;
      }
  },

  getRitualTipNotification: async () => {

    set({ isLoadingRitualTip: true });
    try {
        const token = await AsyncStorage.getItem('x-auth-token');
        if (!token) throw new Error('Authentication token not found.');
        const headers = { 'x-auth-token': token };
        const response = await axios.get(`${API_BASEURL}/notifications/get-todays-ritual-tip`, { headers });
        if (response.data?.success) {
            const data = response.data.data as RitualTipDetailData;
            set({ ritualTipDetail: data, isLoadingRitualTip: false });
            return data;
        } else { throw new Error(response.data.message); }
    } catch (error: any) {
        set({ isLoadingRitualTip: false });
        Alert.alert('Error', error.message);
        return null;
    }
  },


   updateNotificationSettings: async (settings: Partial<NotificationSettings>) => {
    set({ isUpdatingSettings: true, settingsError: null });
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) throw new Error('Authentication token not found.');
      
      const headers = { 'x-auth-token': token };
      const payload = { notifications: settings };

      const response = await axios.put(
        `${API_BASEURL}/user/change-notifications-settings`,
        payload,
        { headers }
      );

      if (response.data?.success) {
        // Update local state with the new settings from the response
        set({
          notificationSettings: response.data.data.notifications,
          isUpdatingSettings: false,
        });
        Alert.alert('Success', 'Settings updated successfully!');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to update settings.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      set({ settingsError: errorMessage, isUpdatingSettings: false });
      Alert.alert('Error', errorMessage);
      return false;
    }
  },
}));

