import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const useImagePermissions = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      setHasCameraPermission(cameraStatus === 'granted');
      setHasGalleryPermission(mediaStatus === 'granted');

      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert("Permission Denied", "Camera and gallery permissions are required.");
      }
    };

    requestPermissions();
  }, []);

  return { hasCameraPermission, hasGalleryPermission };
};

export default useImagePermissions;
