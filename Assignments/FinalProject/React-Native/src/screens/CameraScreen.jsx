import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Modal, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CameraScreen = () => {
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && galleryStatus === 'granted';
  };

  const uploadImage = async (mode) => {
    try {
      let result;
      if (mode === 'camera') {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Camera and gallery permissions are required.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else if (mode === 'gallery') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      }

      console.log("ImagePicker result:", result); // Check the result for debugging
      if (result && !result.cancelled) {
        const imageUri = result.assets ? result.assets[0].uri : result.uri; // Check if `assets` exists
        setImage(imageUri); // Store the URI in the state
        setModalVisible(false); // Close the modal
      }
    } catch (error) {
      console.error("Error during image upload:", error); // Log error for debugging
      Alert.alert('Error', 'An error occurred while uploading the image.');
    }
  };

  const removeImage = () => {
    setImage(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <Text style={styles.placeholder}>No Image Uploaded</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityLabel="Upload image"
      >
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => uploadImage('camera')}
              accessible={true}
              accessibilityLabel="Take a photo with camera"
            >
              <Text style={styles.modalButtonText}>Take a Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => uploadImage('gallery')}
              accessible={true}
              accessibilityLabel="Select an image from gallery"
            >
              <Text style={styles.modalButtonText}>Select from Gallery</Text>
            </TouchableOpacity>

            {image && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={removeImage}
                accessible={true}
                accessibilityLabel="Remove the uploaded image"
              >
                <Text style={styles.modalButtonText}>Remove Image</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
              accessible={true}
                accessibilityLabel="Close modal"
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: 'white',
    alignItems: 'center',
  },
});

export default CameraScreen;
