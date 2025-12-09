import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASEURL } from '@env';
import { useGetNotificationsStore } from './useGetNotificationsStore';

// --- Interfaces ---

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  bio?: string;
  goals?: string[];
  gender: string;
  dob: string;
  time_of_birth: string;
  place_of_birth: string;
  relationship_status: string;
  sign_in_zodiac: string;
  is_premium_user: boolean;
  role: number;
  roleName: string;
  isEmailVerified: boolean;
  lastLogin: string;
  app_language: string;
  profile_image?: {
    key: string | null;
    url: string | null;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      daily_wisdom_cards: boolean;
      ritual_tips: boolean;
    };
    timezone: string;
    theme: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  bio?: string;
  gender?: string;
  goals?: string[];
  dob?: string;
  time_of_birth?: string;
  place_of_birth?: string;
  relationship_status?: string;
  sign_in_zodiac?: string;
}

export interface ProfileImage {
  uri: string;
  type: string;
  name: string;
}

export type LoginResult =
  | 'SUCCESS'
  | 'NOT_VERIFIED'
  | 'WRONG_CREDENTIALS'
  | 'ERROR';

interface AuthState {
  // State
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  isUpdating: boolean;

  // Auth Actions
  login: (
    email: string,
    password: string,
    deviceToken: string,
    app_language: string,
  ) => Promise<LoginResult>;
  googleLogin: (accessToken: string, deviceToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  completeLogin: () => void;

  // Email Verification
  sendVerificationOtp: (email: string) => Promise<boolean>;
  verifyEmailOtp: (email: string, otp: string) => Promise<boolean>;

  // Password Reset
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<boolean>;

  // User Management
  fetchCurrentUser: () => Promise<boolean>;
  updateUserProfile: (data: UpdateProfileData) => Promise<boolean>;
  updatePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;
  uploadProfilePicture: (image: ProfileImage) => Promise<boolean>;
  deleteAccount: (
    reason_for_deletion: string,
    other_reason?: string,
  ) => Promise<boolean>;
  submitSupportTicket: (
    question_for_support: string,
    email: string,
    message: string,
  ) => Promise<boolean>;
  updateAppLanguage: (app_language: string) => Promise<boolean>;
}

// Helper function to get auth token
const getAuthToken = async (
  storeToken: string | null,
): Promise<string | null> => {
  return storeToken || (await AsyncStorage.getItem('x-auth-token'));
};

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data;
    if (Array.isArray(apiError?.message)) {
      return apiError.message.join('\n');
    }
    return apiError?.message || 'An unknown error occurred.';
  }
  return error instanceof Error ? error.message : 'An unknown error occurred.';
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  isLoggedIn: false,
  token: null,
  user: null,
  isUpdating: false,

  // --- LOGIN ---
  login: async (
    email,
    password,
    deviceToken,
    app_language,
  ): Promise<LoginResult> => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/login`,
        { email, password, deviceToken, app_language },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const token = response.data?.token;
      const user = response.data?.user as User;
      const requiresVerification = response.data?.requiresEmailVerification;

      if (!token || !user) {
        Alert.alert('Login Failed', 'Token or user not found in response.');
        return 'ERROR';
      }

      if (requiresVerification === true || user.isEmailVerified === false) {
        set({ isLoggedIn: false, token: null, user: null });
        Alert.alert(
          'Email Not Verified',
          response.data.message ||
            'Please verify your email first. Check your inbox for the code.',
        );
        return 'NOT_VERIFIED';
      }

      await AsyncStorage.setItem('x-auth-token', token);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({ isLoggedIn: true, token, user });
      return 'SUCCESS';
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data;
        const message = Array.isArray(apiError?.message)
          ? apiError.message.join('\n')
          : apiError?.message || 'Login failed';

        if (
          apiError?.message ===
          'Email not verified. Please verify your email first.'
        ) {
          Alert.alert('Email Not Verified', 'Please verify your email first.');
          return 'NOT_VERIFIED';
        }

        const lowerCaseMessage = message.toLowerCase();
        if (
          lowerCaseMessage.includes('invalid credentials') ||
          lowerCaseMessage.includes('wrong password') ||
          lowerCaseMessage.includes('user not found')
        ) {
          Alert.alert('Error', message);
          return 'WRONG_CREDENTIALS';
        }

        Alert.alert('Error', message);
        return 'ERROR';
      }

      Alert.alert('Error', 'Something went wrong. Please try again.');
      return 'ERROR';
    }
  },

  // --- SEND VERIFICATION OTP ---
  sendVerificationOtp: async (email: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/send-verification-otp`,
        { email },
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (response.data?.success) {
        Alert.alert(
          'Check Your Spam Email',
          response.data?.data?.message || 'Verification OTP sent to your email',
        );
        return true;
      }

      throw new Error(response.data.message || 'Failed to send OTP.');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- VERIFY EMAIL OTP ---
  verifyEmailOtp: async (email: string, otp: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/verify-email-otp`,
        { email, otp },
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (response.data?.success) {
        const token = response.data?.data?.token;
        const user = response.data?.data?.user;

        if (!token || !user) {
          throw new Error('Token or user not found in verification response.');
        }

        await AsyncStorage.setItem('x-auth-token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        set({ isLoggedIn: false, token, user });
        Alert.alert('Success', 'Email verified successfully!');
        return true;
      }

      throw new Error(response.data.message || 'Email verification failed.');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- COMPLETE LOGIN ---
  completeLogin: () => {
    const { token, user } = get();
    if (token && user) {
      set({ isLoggedIn: true });
    } else {
      console.error(
        'completeLogin was called, but token/user were missing in the store.',
      );
      Alert.alert(
        'Error',
        'Login failed after verification. Please try logging in again.',
      );
    }
  },

  // --- FETCH CURRENT USER ---
  fetchCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (!token) {
        set({ isLoggedIn: false, user: null, token: null });
        return false;
      }

      const response = await axios.get(`${API_BASEURL}/auth/me`, {
        headers: { 'x-auth-token': token },
      });

      if (response.data?.success) {
        const updatedUser = response.data.user as User;

        set({ user: updatedUser, isLoggedIn: true, token });
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

        if (updatedUser.preferences?.notifications) {
          useGetNotificationsStore.setState({
            notificationSettings: updatedUser.preferences.notifications,
          });
        }

        return true;
      }

      throw new Error(response.data.message || 'Failed to fetch user profile.');
    } catch (error: unknown) {
      console.error('FETCH USER ERROR:', getErrorMessage(error));
      await AsyncStorage.clear();
      set({ isLoggedIn: false, token: null, user: null });
      return false;
    }
  },

  // --- GOOGLE LOGIN ---
  googleLogin: async (accessToken: string, deviceToken: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/google-login`,
        { accessToken, deviceToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const token = response.data?.accessToken;
      const user = response.data?.user;

      if (!token) {
        Alert.alert('Login Failed', 'Access token not found in response.');
        return false;
      }

      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({ isLoggedIn: true, token, user });
      return true;
    } catch (error: unknown) {
      const raw = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      const msg = Array.isArray(raw) ? raw[0] : raw || 'Google login failed';
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- LOGOUT ---
  logout: async () => {
    try {
      await AsyncStorage.removeItem('x-auth-token');
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('user');
      set({ isLoggedIn: false, token: null, user: null });
    } catch (error: unknown) {
      console.error('LOGOUT ERROR:', getErrorMessage(error));
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  },

  // --- CHECK AUTH STATUS ---
  checkAuthStatus: async () => {
    await get().fetchCurrentUser();
  },

  // --- FORGOT PASSWORD ---
  forgotPassword: async (email: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/forgotpassword`,
        { email },
        { headers: { 'Content-Type': 'application/json' } },
      );

      Alert.alert(
        'Success',
        response.data?.message || 'OTP sent successfully!',
      );
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- VERIFY OTP ---
  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await axios.post(
        `${API_BASEURL}/auth/verify-reset-otp`,
        { email, otp },
        { headers: { 'Content-Type': 'application/json' } },
      );

      Alert.alert('Success', 'OTP verified successfully!');
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- RESET PASSWORD ---
  resetPassword: async (
    email: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    try {
      const response = await axios.put(
        `${API_BASEURL}/auth/resetpassword`,
        { email, newPassword, confirmPassword },
        { headers: { 'Content-Type': 'application/json' } },
      );

      Alert.alert('Success', 'Password reset successfully!');
      return true;
    } catch (error: unknown) {
      const raw = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      const msg = Array.isArray(raw) ? raw[0] : raw || 'Password reset failed';
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- DELETE ACCOUNT ---
  deleteAccount: async (reason_for_deletion: string, other_reason?: string) => {
    try {
      const token = await getAuthToken(get().token);

      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please log in.');
        return false;
      }

      const response = await axios.post(
        `${API_BASEURL}/user/deleteaccount`,
        { reason_for_deletion, other_reason: other_reason || '' },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.success) {
        Alert.alert('Success', 'Your account has been successfully deleted.');
        await get().logout();
        return true;
      }

      const msg = response.data?.message || 'Failed to delete account.';
      Alert.alert('Error', msg);
      return false;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          await get().logout();
        }
      }

      return false;
    }
  },

  // --- UPLOAD PROFILE PICTURE ---
  uploadProfilePicture: async (image: ProfileImage) => {
    try {
      const token = await getAuthToken(get().token);

      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        return false;
      }

      const formData = new FormData();
      formData.append('profile_image', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });

      const response = await axios.post(
        `${API_BASEURL}/user/uploadprofilepicture`,
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data?.success) {
        const updatedUser = response.data.user as User;
        set({ user: updatedUser });
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert('Success', 'Profile picture updated successfully!');
        return true;
      }

      throw new Error(response.data.message || 'Failed to upload image.');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- UPDATE USER PROFILE ---
  updateUserProfile: async (data: UpdateProfileData) => {
    set({ isUpdating: true });
    try {
      const token = await getAuthToken(get().token);

      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        set({ isUpdating: false });
        return false;
      }

      const response = await axios.patch(
        `${API_BASEURL}/user/updateuserprofile`,
        data,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.success) {
        const updatedUser = response.data.user as User;
        set({ user: updatedUser, isUpdating: false });
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert(response.data.message || 'Profile updated successfully!');
        return true;
      }

      throw new Error(response.data.message || 'Failed to update profile.');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);
      set({ isUpdating: false });
      return false;
    }
  },

  // --- UPDATE PASSWORD ---
  updatePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    try {
      const token = await getAuthToken(get().token);

      if (!token) {
        Alert.alert(
          'Error',
          'Authentication token not found. Please log in again.',
        );
        return false;
      }

      const response = await axios.put(
        `${API_BASEURL}/auth/updatepassword`,
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.success) {
        const newToken = response.data.data.token;

        if (newToken) {
          await AsyncStorage.setItem('auth_token', newToken);
          set({ token: newToken });
          Alert.alert('Success', 'Password updated successfully!');
          return true;
        }

        throw new Error('New token not found in response.');
      }

      throw new Error(response.data.message || 'Failed to update password.');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- SUBMIT SUPPORT TICKET ---
  submitSupportTicket: async (
    question_for_support: string,
    email: string,
    message: string,
  ) => {
    try {
      const token = await getAuthToken(get().token);

      if (!token) {
        Alert.alert('Error', 'Authentication required. Please log in.');
        return false;
      }

      const response = await axios.post(
        `${API_BASEURL}/user/support`,
        { question_for_support, email, message },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.success) {
        Alert.alert(
          'Success',
          'Your support request has been submitted successfully.',
        );
        return true;
      }

      throw new Error(
        response.data.message || 'Failed to submit support ticket.',
      );
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      Alert.alert('Error', msg);
      return false;
    }
  },

  // --- UPDATE APP LANGUAGE ---
  updateAppLanguage: async (app_language: string) => {
    set({ isUpdating: true });
    try {
      const token = await getAuthToken(get().token);

      if (!token) {
        console.warn('updateAppLanguage: No auth token found.');
        set({ isUpdating: false });
        return false;
      }

      const response = await axios.put(
        `${API_BASEURL}/user/app-language`,
        { app_language },
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.success) {
        const updatedUser = response.data.user as User;
        set({ user: updatedUser, isUpdating: false });
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }

      throw new Error(
        response.data.message || 'Failed to update app language.',
      );
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      console.error('updateAppLanguage ERROR:', msg);
      set({ isUpdating: false });
      return false;
    }
  },
}));
