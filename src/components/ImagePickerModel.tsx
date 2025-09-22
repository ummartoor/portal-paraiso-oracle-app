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

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onImagePicked: (imagePath: string) => void;
}

const ImagePickerModal = ({ isVisible, onClose, onImagePicked }: Props) => {
  const handlePermission = async (type: 'Camera' | 'Gallery') => {
    const permission =
      Platform.OS === 'android'
        ? type === 'Camera'
          ? PERMISSIONS.ANDROID.CAMERA
          : Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        : type === 'Camera'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.IOS.PHOTO_LIBRARY;

    const status = await check(permission);
    console.log('Camera permission status:', status); //output 'denied'

    if (status === RESULTS.GRANTED) return true;

    if (status === RESULTS.DENIED) {
      const result = await request(permission);
      console.log('result is', result); //output 'blocked'

      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          `${type} Permission Blocked`,
          `Please enable ${type} permission from settings.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() }, // FIXED: call the function
          ],
        );
        return false;
      }

      return result === RESULTS.GRANTED;
    }

    if (status === RESULTS.BLOCKED) {
      Alert.alert(
        `${type} Permission Blocked`,
        `Please enable ${type} permission from settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings },
        ],
      );
    }
    return false;
  };

  const openCamera = async () => {
    console.log('carmera is called');
    const granted = await handlePermission('Camera');

    console.log('permission is', granted);
    if (!granted) return;

    try {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 300,
        cropping: true,
        cropperToolbarTitle: 'Edit Image',
        cropperToolbarColor: '#000000',
        cropperToolbarWidgetColor: '#ffffff',
        cropperStatusBarColor: '#000000',
      });
      onImagePicked(image.path);
      onClose();
    } catch (error) {
      // user cancelled
    }
  };

  const openGallery = async () => {
    const granted = await handlePermission('Gallery');
    if (!granted) return;

    try {
      const image = await ImagePicker.openPicker({
        // width: 300,
        // height: 300,
        cropping: true,
        compressImageQuality:1,
        cropperToolbarTitle: 'Edit Image',
        cropperToolbarColor: '#000000',
        cropperToolbarWidgetColor: '#ffffff',
        cropperStatusBarColor: '#000000',
      });
      onImagePicked(image.path);
      onClose();
    } catch (error) {
      // user cancelled
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
