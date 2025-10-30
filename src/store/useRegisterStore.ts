
import { create } from 'zustand';
 import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';

import { showErrorToast, showSuccessToast } from '../utils/toastHelper';
// --- Interfaces ---

// --- ADDED: Interface to define the structure of the user object ---
interface User {
  _id: string;
  name: string;
  email: string;
  dob?: string;
  time_of_birth?: string;
  place_of_birth?: string;
  gender?: string;
  relationship_status?: string;
  goals?: string[];
  sign_in_zodiac?: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
    timezone: string; 
  app_language: string; 

}

interface UpdateUserDetailsPayload {
  gender?: string;
  goals?: string[];
  dob?: string;
  time_of_birth?: string;
  place_of_birth?: string;
  relationship_status?: string;
  sign_in_zodiac?: string;
}

// --- MODIFIED: Added userData to the state definition ---
interface RegisterState {
  isRegistering: boolean;
  isUpdating: boolean;
  token: string | null;
  userData: User | null; // <-- ADDED
  register: (
    data: RegisterPayload,
  ) => Promise<{ success: boolean; user?: any; token?: string }>;
  updateUserDetails: (data: UpdateUserDetailsPayload) => Promise<boolean>;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({ 
  isRegistering: false,
  isUpdating: false,
  token: null,
  userData: null, 

  // --- REGISTER ---
  register: async data => {
    set({ isRegistering: true });
    try {
      const response = await axios.post(`${API_BASEURL}/auth/register-user`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      const token = response.data?.data?.token; 
      const user = response.data?.data?.user as User; 
      console.log(response.data)
      if (token && user) {
        await AsyncStorage.setItem('x-auth-token', token);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        // --- MODIFIED: Save user and token to state ---
        set({ isRegistering: false, token: token, userData: user }); 
        return { success: true, user, token };
      } else {
        Alert.alert('Registration Failed', 'Token or user not found in response.');
        set({ isRegistering: false });
        return { success: false };
      }
    } catch (error: any) {
        const apiError = error.response?.data;
      const message = Array.isArray(apiError?.message)
        ? apiError.message.join('\n')
        : apiError?.message || 'Registration failed due to a network error.';
      
      // --- CHANGE: Replaced Alert with toast ---
       Alert.alert('Registration Error', message);
      // showErrorToast('Registration Error', message);
      set({ isRegistering: false });
      return { success: false };
    }
  },

  // --- UPDATE USER DETAILS ---
  updateUserDetails: async (data) => {
    set({ isUpdating: true }); 
    try {
      let token = get().token; 
      if (!token) {
        token = await AsyncStorage.getItem('x-auth-token');
      }

      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in.');
        set({ isUpdating: false });
        return false;
      }
      
      const response = await axios.patch(
        `${API_BASEURL}/user/updatedetails`, 
        data, 
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token, 
          },
        }
      );
      console.log(response.data)
      // --- MODIFIED: Get user object from response and save it ---
      if (response.data && response.data.success) {
        const updatedUser = response.data.user as User;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Save updated user data to the store's state
        set({ isUpdating: false, userData: updatedUser });
        return true;
      } else {
         throw new Error(response.data.message || 'Failed to update profile.');
      }

    } catch (error: any) {
      const apiError = error.response?.data;
      const message = apiError?.message || 'Failed to update profile.';
      Alert.alert('Error', message);
      set({ isUpdating: false });
      return false;
    }
  },
}));








// import { create } from 'zustand';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { Alert } from 'react-native';
// import { API_BASEURL } from '@env';

// // --- Interfaces ---

// interface RegisterPayload {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
// }

// interface UpdateUserDetailsPayload {
//   gender?: string;
//   goals?: string[];
//   dob?: string;
//   time_of_birth?: string;
//   place_of_birth?: string;
//   relationship_status?: string;
//   sign_in_zodiac?: string;
// }

// interface RegisterState {
//   isRegistering: boolean;
//   isUpdating: boolean; // For loading state on update screens
//   token: string | null; // To solve the timing issue
//   register: (
//     data: RegisterPayload,
//   ) => Promise<{ success: boolean; user?: any; token?: string }>;
//   updateUserDetails: (data: UpdateUserDetailsPayload) => Promise<boolean>;
// }

// export const useRegisterStore = create<RegisterState>((set, get) => ({ 
//   isRegistering: false,
//   isUpdating: false, // Initial state for loading
//   token: null, // Initial state for token

//   // --- REGISTER ---
//   register: async data => {
//     set({ isRegistering: true });
//     try {
//       const response = await axios.post(`${API_BASEURL}/auth/register-user`, data, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const token = response.data?.token; 
//       const user = response.data?.user;
//       console.log(response.data)
//       if (token) {
//         await AsyncStorage.setItem('x-auth-token', token);
//         await AsyncStorage.setItem('isLoggedIn', 'true');
//         await AsyncStorage.setItem('user', JSON.stringify(user));
        
//         // Save token to state immediately to prevent race condition
//         set({ isRegistering: false, token: token }); 
//         return { success: true, user, token };
//       } else {
//         Alert.alert('Registration Failed', 'Token not found in response.');
//         set({ isRegistering: false });
//         return { success: false };
//       }
//     } catch (error: any) {
//       const apiError = error.response?.data;
//       const message = Array.isArray(apiError?.message) ? apiError.message.join('\n') : apiError?.message || 'Registration failed';
//       Alert.alert('Error', message);
//       set({ isRegistering: false });
//       return { success: false };
//     }
//   },

//   // --- UPDATE USER DETAILS ---
//   updateUserDetails: async (data) => {
//     set({ isUpdating: true }); 
//     try {
//       // First, try to get the token from the state
//       let token = get().token; 
//       // If not in state (e.g., app was closed and reopened), get from storage
//       if (!token) {
//         token = await AsyncStorage.getItem('x-auth-token');
//       }

//       if (!token) {
//         Alert.alert('Error', 'Authentication token not found. Please log in.');
//         set({ isUpdating: false });
//         return false;
//       }
      
//       const response = await axios.patch(
//         `${API_BASEURL}/user/updatedetails`, 
//         data, 
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'x-auth-token': token, 
         
//           },
//         }
//       );
// console.log(response.data)
//       await AsyncStorage.setItem('user', JSON.stringify(response.data));
//       // Alert.alert('Success', 'Profile updated successfully!'); 
      
//       set({ isUpdating: false });
//       return true;

//     } catch (error: any) {
//       const apiError = error.response?.data;
//       const message = apiError?.message || 'Failed to update profile.';
//       Alert.alert('Error', message);
//       set({ isUpdating: false });
//       return false;
//     }
//   },
// }));