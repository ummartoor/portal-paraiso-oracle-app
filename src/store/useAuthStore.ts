// import { create } from 'zustand';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface AuthState {
//   isLoggedIn: boolean;
//   login: () => Promise<void>;
//   logout: () => Promise<void>;
//   checkAuthStatus: () => Promise<void>;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   isLoggedIn: false,

//   login: async () => {
//     await AsyncStorage.setItem('isLoggedIn', 'true');
//     set({ isLoggedIn: true });
//   },

//   logout: async () => {
//     await AsyncStorage.removeItem('isLoggedIn');
//     set({ isLoggedIn: false });
//   },

//   checkAuthStatus: async () => {
//     const status = await AsyncStorage.getItem('isLoggedIn');
//     set({ isLoggedIn: status === 'true' });
//   },
// }));



import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from   '@env';

// --- Interfaces ---

interface User {
  _id: string;
  name: string;
  email: string;
  gender: string;
  dob: string;
  time_of_birth: string;
  place_of_birth: string;
  relationship_status: string;
  sign_in_zodiac: string;
  is_premium_user: boolean;
  // You can add other fields from the response here if you need them
}
interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
 user: User | null;
  login: (
    email: string,
    password: string,
    deviceToken: string,
  ) => Promise<boolean>;

  googleLogin: (accessToken: string, deviceToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;

  resetPassword: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<boolean>;
   fetchCurrentUser: () => Promise<boolean>; 
  checkAuthStatus: () => Promise<void>;
   deleteAccount: () => Promise<boolean>; 
}

// --- Auth Store ---
export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  token: null,
  user: null,

  // --- LOGIN ---
login: async (email, password, deviceToken) => {
  try {
    const response = await axios.post(
      `${API_BASEURL}/auth/login`,
      {
        email,
        password,
        deviceToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('LOGIN RESPONSE:', response.data);

  
    const token = response.data?.token; 

    const user = response.data?.user;

    if (token) {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({ isLoggedIn: true, token, user });
      return true;
    } else {
      Alert.alert('Login Failed', 'Token not found in response.');
      return false;
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data;
      console.log('LOGIN ERROR RESPONSE:', apiError);
      const message = Array.isArray(apiError?.message)
        ? apiError.message.join('\n')
        : apiError?.message || 'Login failed';
      Alert.alert('Error', message);
    } else {
      console.log('Unexpected Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    return false;
  }
},

// Add this entire function inside your create() block

// --- FETCH CURRENT USER ---
fetchCurrentUser: async () => {
  try {
    // 1. Get token from storage, as this often runs on app start
    const token = await AsyncStorage.getItem('auth_token');

    if (!token) {
      // If no token, there's no user to fetch
      set({ isLoggedIn: false, user: null, token: null });
      return false;
    }

    // 2. Make the API call to the /auth/me endpoint
    const response = await axios.get(`${API_BASEURL}/auth/me`, {
      headers: {
        'x-auth-token': token,
      },
    });
    
    console.log('FETCH CURRENT USER RESPONSE:', response.data);

    // 3. On success, update the user state
    if (response.data && response.data.success) {
      const updatedUser = response.data.user as User;
      
      // Update user data in both the store and AsyncStorage
      set({ user: updatedUser, isLoggedIn: true, token });
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return true;
    } else {
      throw new Error(response.data.message || 'Failed to fetch user profile.');
    }
  } catch (error: any) {
    console.log('FETCH USER ERROR:', error.response?.data?.message || error.message);
    
    // If token is invalid, the API might return an error. Log the user out.
    await AsyncStorage.clear();
    set({ isLoggedIn: false, token: null, user: null });
    
    return false;
  }
},
  googleLogin: async (accessToken: string, deviceToken: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/google-login`,
        {
          accessToken,
          deviceToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('GOOGLE LOGIN SUCCESS:', response.data);

      const token = response.data?.accessToken;
      const user = response.data?.user;

      if (token) {
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('user', JSON.stringify(user));

        set({ isLoggedIn: true, token, user });
        return true;
      } else {
        Alert.alert('Login Failed', 'Access token not found in response.');
        return false;
      }
    } catch (error: any) {
      const raw = error?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw || 'Google login failed';
      console.log('GOOGLE LOGIN ERRORr', msg);
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- LOGOUT ---
  logout: async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('user');
      set({ isLoggedIn: false, token: null, user: null });
    } catch (error: any) {
      console.log('LOGOUT ERROR:', error.message);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  },

  // --- CHECK AUTH STATUS ---
  // checkAuthStatus: async () => {
  //   const token = await AsyncStorage.getItem('auth_token');
  //   const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
  //   const userData = await AsyncStorage.getItem('user');

  //   set({
  //     isLoggedIn: isLoggedIn === 'true',
  //     token,
  //     user: userData ? JSON.parse(userData) : null,
  //   });
  // },
  
// --- CHECK AUTH STATUS  ---
checkAuthStatus: async () => {
  // This will now verify the token with the server and get the latest user data
  await get().fetchCurrentUser();
},
  //forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/forgotpassword`,
        {
          email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('FORGOT PASSWORD SUCCESS:', response.data);
      Alert.alert(
        'Success',
        response.data?.message || 'OTP sent successfully!',
      );
      return true;
    } catch (error: any) {
      console.log(
        'FORGOT PASSWORD ERROR:',
        error.response?.data || error.message,
      );
      const msg = error?.response?.data?.message || 'Failed to send OTP';
      Alert.alert('Error', msg);
      return false;
    }
  },

  // VERIFY OTP
  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/verify-reset-otp`,
        {
          email,
          otp,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      console.log('VERIFY OTP SUCCESS:', response.data);
      Alert.alert('Success', 'OTP verified successfully!');
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'OTP verification failed';
      console.log('VERIFY OTP ERROR:', msg);
      Alert.alert('Error', msg);
      return false;
    }
  },

 
  // reset password
 resetPassword: async (
    email: string,

    newPassword: string,
    confirmPassword: string,
  ): Promise<boolean> => {
    try {
      const response = await axios.put( // Ensure this is .put
        `${API_BASEURL}/auth/resetpassword`,
        {
          email,
          // --- CHANGE THIS KEY IN THE REQUEST BODY ---
          newPassword, // Change from `password: password` to `newPassword: newPassword`
          confirmPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('RESET PASSWORD SUCCESS:', response.data);
      Alert.alert('Success', 'Password reset successfully!');
      return true;
    } catch (error: any) {
      const raw = error?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw || 'Password reset failed';
      console.log('RESET PASSWORD ERROR:', msg);
      Alert.alert('Error', msg);
      return false;
    }
  },

   // --- DELETE ACCOUNT ---
  deleteAccount: async (): Promise<boolean> => {
    try {
      const token = get().token || (await AsyncStorage.getItem('auth_token'));

      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please log in.');
        return false;
      }

      const response = await axios.delete(
        `${API_BASEURL}/user/deleteaccount`,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json', 
          },
        },
      );

      console.log('DELETE ACCOUNT SUCCESS:', response.data);

      if (response.data && response.data.success) {
        Alert.alert('Success', 'Your account has been successfully deleted.');
        // After deleting the account, perform a logout
        await get().logout(); 
        return true;
      } else {
        // This else block might be hit if success is false but no error was thrown by axios
        const msg = response.data?.message || 'Failed to delete account.';
        Alert.alert('Error', msg);
        return false;
      }
    } catch (error: any) {
      console.log(
        'DELETE ACCOUNT ERROR:',
        error.response?.data?.message || error.message,
      );
      const msg = error?.response?.data?.message || 'Failed to delete account. Please try again.';
      Alert.alert('Error', msg);

      // If the error indicates an invalid or expired token, also log out.
      if (error.response?.status === 401 || error.response?.status === 403) {
        await get().logout();
      }
      return false;
    }
  },
}));