// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Platform,
//   Alert,
// } from 'react-native';
// import Modal from 'react-native-modal';
// import ImagePicker from 'react-native-image-crop-picker';
// import {
//   check,
//   request,
//   PERMISSIONS,
//   RESULTS,
//   openSettings,
// } from 'react-native-permissions';

// type ImagePickerResponse = {
//   uri: string;
//   type: string;
//   name: string;
// };

// type Props = {
//   isVisible: boolean;
//   onClose: () => void;
//   onImagePicked: (image: ImagePickerResponse) => void;
// };

// const ImagePickerModal = ({ isVisible, onClose, onImagePicked }: Props) => {
//   const handlePermission = async (type: 'Camera' | 'Gallery') => {
//     const permission =
//       Platform.OS === 'android'
//         ? type === 'Camera'
//           ? PERMISSIONS.ANDROID.CAMERA
//           : Platform.Version >= 33
//           ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
//           : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
//         : type === 'Camera'
//         ? PERMISSIONS.IOS.CAMERA
//         : PERMISSIONS.IOS.PHOTO_LIBRARY;

//     const status = await check(permission);

//     if (status === RESULTS.GRANTED) return true;

//     if (status === RESULTS.DENIED) {
//       const result = await request(permission);
//       if (result === RESULTS.GRANTED) {
//         return true;
//       }
//     }

//     // If we reach here, permission is blocked or was denied again
//     Alert.alert(
//       `${type} Permission Required`,
//       `To continue, please enable ${type} permission from your device settings.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Open Settings', onPress: () => openSettings() },
//       ],
//     );
//     return false;
//   };

//   const openCamera = async () => {
//     const granted = await handlePermission('Camera');
//     if (!granted) return;

//     try {
//       const image = await ImagePicker.openCamera({
//         width: 500,
//         height: 500,
//         cropping: true,
//       });

//       // --- FIX: Create the full image object ---
//       onImagePicked({
//         uri: image.path,
//         type: image.mime,
//         name: image.path.split('/').pop() || 'camera_photo.jpg', // Create a name from the path
//       });

//       onClose();
//     } catch (error) {
//       // User cancelled the action
//       console.log('Camera cancelled by user.');
//     }
//   };

//   const openGallery = async () => {
//     const granted = await handlePermission('Gallery');
//     if (!granted) return;

//     try {
//       const image = await ImagePicker.openPicker({
//         width: 500,
//         height: 500,
//         cropping: true,
//         compressImageQuality: 1,
//       });

//       // --- FIX: Create the full image object ---
//       onImagePicked({
//         uri: image.path,
//         type: image.mime,
//         name: image.filename || image.path.split('/').pop() || 'gallery_photo.jpg', // Use original filename or create one
//       });

//       onClose();
//     } catch (error) {
//       // User cancelled the action
//       console.log('Gallery picker cancelled by user.');
//     }
//   };

//   return (
//     <Modal
//       isVisible={isVisible}
//       onBackdropPress={onClose}
//       onBackButtonPress={onClose}
//       style={styles.modal}
//     >
//       <View style={styles.container}>
//         <TouchableOpacity style={styles.option} onPress={openCamera}>
//           <Text style={styles.optionText}>Take Photo</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.option} onPress={openGallery}>
//           <Text style={styles.optionText}>Select from Gallery</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.option, styles.cancel]}
//           onPress={onClose}
//         >
//           <Text style={styles.optionText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </Modal>
//   );
// };

// export default ImagePickerModal;

// const styles = StyleSheet.create({
//   modal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   container: {
//     backgroundColor: '#222',
//     paddingVertical: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   option: {
//     paddingVertical: 15,
//     alignItems: 'center',
//   },
//   optionText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   cancel: {
//     borderTopWidth: 1,
//     borderColor: '#444',
//     marginTop: 10,
//   },
// });

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

type ImagePickerResponse = {
  uri: string;
  type: string;
  name: string;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onImagePicked: (image: ImagePickerResponse) => void;
};

const ImagePickerModal = ({ isVisible, onClose, onImagePicked }: Props) => {
  const handlePermission = async (type: 'Camera' | 'Gallery') => {
    let permission;

    if (Platform.OS === 'android') {
      if (type === 'Camera') {
        permission = PERMISSIONS.ANDROID.CAMERA;
      } else {
        permission =
          Platform.Version >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }
    } else {
      if (type === 'Camera') {
        permission = PERMISSIONS.IOS.CAMERA;
      } else {
        // Full photo library access (iOS 14+ still uses PHOTO_LIBRARY for read)
        permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      }
    }

    const status = await check(permission);

    if (status === RESULTS.GRANTED) return true;

    if (status === RESULTS.DENIED) {
      const result = await request(permission);
      if (result === RESULTS.GRANTED) return true;
    }

    // Permission blocked or still denied
    Alert.alert(
      `${type} Permission Required`,
      `Please enable ${type} access in your device settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => openSettings() },
      ],
    );
    return false;
  };

  const openCamera = async () => {
    const granted = await handlePermission('Camera');
    if (!granted) return;

    try {
      const image = await ImagePicker.openCamera({
        width: 500,
        height: 500,
        cropping: true,
      });

      onImagePicked({
        uri: image.path,
        type: image.mime,
        name: image.path.split('/').pop() || 'camera_photo.jpg',
      });

      onClose();
    } catch (error: any) {
      if (error.message?.includes('User cancelled')) {
        console.log('Camera cancelled by user.');
      } else {
        console.warn('Camera error:', error);
      }
    }
  };

  const openGallery = async () => {
    const granted = await handlePermission('Gallery');
    if (!granted) return;

    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true,
        compressImageQuality: 1,
      });

      onImagePicked({
        uri: image.path,
        type: image.mime,
        name:
          image.filename || image.path.split('/').pop() || 'gallery_photo.jpg',
      });

      onClose();
    } catch (error: any) {
      if (error.message?.includes('User cancelled')) {
        console.log('Gallery picker cancelled by user.');
      } else {
        console.warn('Gallery error:', error);
      }
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.option} onPress={openCamera}>
          <Text style={styles.optionText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={openGallery}>
          <Text style={styles.optionText}>Select from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, styles.cancel]}
          onPress={onClose}
        >
          <Text style={styles.optionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImagePickerModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#222',
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  option: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  cancel: {
    borderTopWidth: 1,
    borderColor: '#444',
    marginTop: 10,
  },
});