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


// interface RegisterState {
//   isRegistering: boolean;
//   register: (
//     data: RegisterPayload,
//   ) => Promise<{ success: boolean; user?: any; token?: string }>;
// }

// export const useRegisterStore = create<RegisterState>(set => ({
//   isRegistering: false,

//   // --- REGISTER ---
//   register: async data => {
//     set({ isRegistering: true });
    
//     try {

//       const response = await axios.post(`${API_BASEURL}/auth/register-user`, data, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       console.log('REGISTER RESPONSE:', response.data);

     
//       const token = response.data?.token; 
//       const user = response.data?.user;

//       if (token) {
//         await AsyncStorage.setItem('auth_token', token);
//         await AsyncStorage.setItem('isLoggedIn', 'true');
//         await AsyncStorage.setItem('user', JSON.stringify(user));

//         set({ isRegistering: false });
//         return { success: true, user, token };
//       } else {
//         Alert.alert('Registration Failed', 'Token not found in response.');
//         set({ isRegistering: false });
//         return { success: false };
//       }
//     } catch (error: any) {
//       console.log('REGISTER ERROR:', error.response?.data || error.message);
      
//       const apiError = error.response?.data;
//       const message = Array.isArray(apiError?.message)
//         ? apiError.message.join('\n')
//         : apiError?.message || 'Registration failed';
        
//       Alert.alert('Error', message);
//       set({ isRegistering: false });
//       return { success: false };
//     }
//   },
// }));



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

// // --- ADDED: New Interface for the update details payload ---
// interface UpdateUserDetailsPayload {
//   gender?: string;
//   goals?: string[];
//   dob?: string;
//   time_of_birth?: string;
//   place_of_birth?: string;
//   relationship_status?: string;
// }

// interface RegisterState {
//   isRegistering: boolean;
//   register: (
//     data: RegisterPayload,
//   ) => Promise<{ success: boolean; user?: any; token?: string }>;
//   // --- ADDED: New function signature to the state ---
//   updateUserDetails: (data: UpdateUserDetailsPayload) => Promise<boolean>;
// }

// export const useRegisterStore = create<RegisterState>(set => ({
//   isRegistering: false,

//   // --- REGISTER ---
//   register: async data => {
//     set({ isRegistering: true });
    
//     try {
//       const response = await axios.post(`${API_BASEURL}/auth/register-user`, data, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       console.log('REGISTER RESPONSE:', response.data);
      
//       const token = response.data?.token; 
//       const user = response.data?.user;

//       if (token) {
//         await AsyncStorage.setItem('x-auth-token', token);
//         await AsyncStorage.setItem('isLoggedIn', 'true');
//         // await AsyncStorage.setItem('user', JSON.stringify(user));

//         set({ isRegistering: false });
//         return { success: true, user, token };
//       } else {
//         Alert.alert('Registration Failed', 'Token not found in response.');
//         set({ isRegistering: false });
//         return { success: false };
//       }
//     } catch (error: any) {
//       console.log('REGISTER ERROR:', error.response?.data || error.message);
      
//       const apiError = error.response?.data;
//       const message = Array.isArray(apiError?.message)
//         ? apiError.message.join('\n')
//         : apiError?.message || 'Registration failed';
        
//       Alert.alert('Error', message);
//       set({ isRegistering: false });
//       return { success: false };
//     }
//   },

//   // --- ADDED: New function to update user details ---
//   updateUserDetails: async (data) => {
//     try {
//       const token = await AsyncStorage.getItem('x-auth-token');
//       console.log('getToken',token)
//       if (!token) {
//         Alert.alert('Error', 'Authentication token not found.');
//         return false;
//       }

//       const response = await axios.patch(
//         `${API_BASEURL}/user/updatedetails`, 
//         data, 
//         {
//           headers: {
//             'Content-Type': 'application/json',
//        'x-auth-token': token,
//           },
//         }
//       );

//       console.log('UPDATE USER DETAILS SUCCESS:', response.data);

//       // Update user data in AsyncStorage with the response
//       await AsyncStorage.setItem('user', JSON.stringify(response.data));
//       Alert.alert('Success', 'Profile updated successfully!');
      
//       return true;

//     } catch (error: any) {
//       // console.log('UPDATE USER DETAILS ERROR:', error.response?.data || error.message);
      
//       // const apiError = error.response?.data;
//       // const message = Array.isArray(apiError?.message)
//       //   ? apiError.message.join('\n')
//       //   : apiError?.message || 'Failed to update profile.';
        
//       // Alert.alert('Error', message);

//       if (axios.isAxiosError(error)) {
//         const apiError = error.response?.data;
//         console.log('UPDATE USER DETAILS ERROR:', apiError);
//         const message = Array.isArray(apiError?.message)
//           ? apiError.message.join('\n') // in case message is an array
//           : apiError?.message;
//         Alert.alert('Error', message);
//       } else {
//         console.log('Unexpected Error:', error);
//         Alert.alert('Error', 'Something went wrong. Please try again.');
//       }
//       return false;
//     }
//   },
// }));









import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';

// --- Interfaces ---

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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

interface RegisterState {
  isRegistering: boolean;
  isUpdating: boolean; // For loading state on update screens
  token: string | null; // To solve the timing issue
  register: (
    data: RegisterPayload,
  ) => Promise<{ success: boolean; user?: any; token?: string }>;
  updateUserDetails: (data: UpdateUserDetailsPayload) => Promise<boolean>;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({ 
  isRegistering: false,
  isUpdating: false, // Initial state for loading
  token: null, // Initial state for token

  // --- REGISTER ---
  register: async data => {
    set({ isRegistering: true });
    try {
      const response = await axios.post(`${API_BASEURL}/auth/register-user`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      const token = response.data?.token; 
      const user = response.data?.user;
      console.log(response.data)
      if (token) {
        await AsyncStorage.setItem('x-auth-token', token);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        // Save token to state immediately to prevent race condition
        set({ isRegistering: false, token: token }); 
        return { success: true, user, token };
      } else {
        Alert.alert('Registration Failed', 'Token not found in response.');
        set({ isRegistering: false });
        return { success: false };
      }
    } catch (error: any) {
      const apiError = error.response?.data;
      const message = Array.isArray(apiError?.message) ? apiError.message.join('\n') : apiError?.message || 'Registration failed';
      Alert.alert('Error', message);
      set({ isRegistering: false });
      return { success: false };
    }
  },

  // --- UPDATE USER DETAILS ---
  updateUserDetails: async (data) => {
    set({ isUpdating: true }); 
    try {
      // First, try to get the token from the state
      let token = get().token; 
      // If not in state (e.g., app was closed and reopened), get from storage
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
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      // Alert.alert('Success', 'Profile updated successfully!'); 
      
      set({ isUpdating: false });
      return true;

    } catch (error: any) {
      const apiError = error.response?.data;
      const message = apiError?.message || 'Failed to update profile.';
      Alert.alert('Error', message);
      set({ isUpdating: false });
      return false;
    }
  },
}));