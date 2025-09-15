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
interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: any | null;
  login: (
    email: string,
    password: string,
    deviceToken: string,
  ) => Promise<boolean>;
  googleLogin: (accessToken: string, deviceToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  resetPassword: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<boolean>;

  checkAuthStatus: () => Promise<void>;
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
  checkAuthStatus: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    const userData = await AsyncStorage.getItem('user');

    set({
      isLoggedIn: isLoggedIn === 'true',
      token,
      user: userData ? JSON.parse(userData) : null,
    });
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
        `${API_BASEURL}/auth/verify-otp`,
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

  // RESEND OTP
  resendOtp: async (email: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/resend-otp`,
        {
          email,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      console.log('RESEND OTP SUCCESS:', response.data);
      Alert.alert(
        'Success',
        response.data?.message || 'OTP resent successfully!',
      );
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to resend OTP';
      console.log('RESEND OTP ERROR:', msg);
      Alert.alert('Error', msg);
      return false;
    }
  },
  // reset password
  resetPassword: async (
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/reset-password`,
        {
          email,
          password,
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
}));