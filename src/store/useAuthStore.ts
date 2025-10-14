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
import { useGetNotificationsStore } from './useGetNotificationsStore';

// --- Interfaces ---

interface User {
  _id: string;
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

    profile_image?: {
    key: string | null;
    url: string | null;
  };

    // preferences object add karein
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      daily_wisdom_cards: boolean;
      ritual_tips: boolean;
    };
}

}

type UpdateProfileData = {
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
};


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
 deleteAccount: (reason_for_deletion: string, other_reason?: string) => Promise<boolean>; 

    uploadProfilePicture: (image: {
    uri: string;
    type: string;
    name: string;
  }) => Promise<boolean>;
   isUpdating: boolean;
    updateUserProfile: (data: UpdateProfileData) => Promise<boolean>;
      updatePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;

  submitSupportTicket: (
    question_for_support: string,
    email: string,
    message: string,
  ) => Promise<boolean>;
}

// --- Auth Store ---
export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  token: null,
  user: null,
 isUpdating: false,
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
      await AsyncStorage.setItem('x-auth-token', token);
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

      if (response.data && response.data.success) {
        const updatedUser = response.data.user as User;

        set({ user: updatedUser, isLoggedIn: true, token });
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // --- CHANGE: Sahi path se notification settings haasil karein ---
        if (updatedUser.preferences?.notifications) {
          useGetNotificationsStore.setState({ 
            notificationSettings: updatedUser.preferences.notifications 
          });
        }
        
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user profile.');
      }
    } catch (error: any) {
      console.log('FETCH USER ERROR:', error.response?.data?.message || error.message);
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
      await AsyncStorage.removeItem('x-auth-token');
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
    
          newPassword, 
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
  deleteAccount: async (reason_for_deletion: string, other_reason?: string): Promise<boolean> => {
    try {
      const token = get().token || (await AsyncStorage.getItem('x-auth-token'));

      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please log in.');
        return false;
      }

      const body = {
        reason_for_deletion,
        other_reason: other_reason || '',
      };

      const response = await axios.post( 
        `${API_BASEURL}/user/deleteaccount`,
        body,
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
  // --- UPLOAD PROFILE PICTURE ---
uploadProfilePicture: async (image) => {
  try {
    const token = get().token || await AsyncStorage.getItem('auth_token');
    if (!token) {
      Alert.alert('Error', 'Authentication token not found.');
      return false;
    }

    // 1. Create a FormData object
    // This is necessary for file uploads
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
          // For FormData, this header is crucial
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('UPLOAD PICTURE SUCCESS:', response.data);

    // 4. On success, update the user state with the new data
    if (response.data && response.data.success) {
      const updatedUser = response.data.user as User;
      
      // Update the user in the store and in local storage
      set({ user: updatedUser });
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      Alert.alert('Success', 'Profile picture updated successfully!');
      return true;
    } else {
      throw new Error(response.data.message || 'Failed to upload image.');
    }
  } catch (error: any) {
    const msg = error.response?.data?.message || 'An unknown error occurred.';
    console.log('UPLOAD PICTURE ERROR:', msg);
    Alert.alert('Error', msg);
    return false;
  }
},

  // --- UPDATE USER PROFILE ---
  updateUserProfile: async (data: UpdateProfileData) => {
    set({ isUpdating: true }); // <-- MODIFIED: Set loading state
    try {
      const token = get().token || await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        set({ isUpdating: false }); // <-- MODIFIED
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

      if (response.data && response.data.success) {
        const updatedUser = response.data.user as User;
        set({ user: updatedUser, isUpdating: false }); // <-- MODIFIED
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert('Success', 'Profile updated successfully!');
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to update profile.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'An unknown error occurred.';
      Alert.alert('Error', msg);
      set({ isUpdating: false }); // <-- MODIFIED
      return false;
    }
  },
// --- UPDATE PASSWORD ---
updatePassword: async (currentPassword, newPassword, confirmPassword) => {
  try {
    // Store se ya AsyncStorage se token haasil karein
    const token = get().token || await AsyncStorage.getItem('auth_token');
    if (!token) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.');
      return false;
    }

    // Request body tayyar karein
    const body = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    // PUT request bheejein
    const response = await axios.put(
      `${API_BASEURL}/auth/updatepassword`,
      body,
      {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('UPDATE PASSWORD SUCCESS:', response.data);

 
    if (response.data && response.data.success) {
      const newToken = response.data.data.token;

      if (newToken) {
     
        await AsyncStorage.setItem('auth_token', newToken);
        set({ token: newToken });

        Alert.alert('Success', 'Password updated successfully!');
        return true;
      } else {
        throw new Error('New token not found in response.');
      }
    } else {
      throw new Error(response.data.message || 'Failed to update password.');
    }
  } catch (error: any) {
    const msg = error.response?.data?.message || 'An unknown error occurred.';
    console.log('UPDATE PASSWORD ERROR:', msg);
    Alert.alert('Error', msg);
    return false;
  }
},
  // --- NEW FUNCTION IMPLEMENTATION ---
  submitSupportTicket: async (question_for_support, email, message) => {
    try {
        const token = get().token || (await AsyncStorage.getItem('x-auth-token'));
        if (!token) {
            Alert.alert('Error', 'Authentication required. Please log in.');
            return false;
        }

        const response = await axios.post(
            `${API_BASEURL}/user/support`,
            {
                question_for_support,
                email,
                message,
            },
            {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json',
                },
            },
        );

        console.log('SUPPORT TICKET SUCCESS:', response.data);

        if (response.data && response.data.success) {
            Alert.alert('Success', 'Your support request has been submitted successfully.');
            return true;
        } else {
            throw new Error(response.data.message || 'Failed to submit support ticket.');
        }
    } catch (error: any) {
        console.log(
            'SUPPORT TICKET ERROR:',
            error.response?.data?.message || error.message,
        );
        const msg = error?.response?.data?.message || 'Failed to submit your request. Please try again.';
        Alert.alert('Error', msg);
        return false;
    }
  },
}));