import Toast from 'react-native-toast-message';

/**
 * Shows a success toast message.
 * @param {string} title - The main message to show.
 * @param {string} [body] - Optional sub-message.
 */
export const showSuccessToast = (title: string, body?: string) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: body,
    visibilityTime: 2000, // Show for 2 seconds
  });
};

/**
 * Shows an error toast message.
 * @param {string} title - The main error message.
 * @param {string} [body] - Optional sub-message for the error.
 */
export const showErrorToast = (title: string, body?: string) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: body,
    visibilityTime: 4000, // Show for 4 seconds
  });
};