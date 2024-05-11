import React, { useState, useEffect } from 'react';
import {
  ImageBackground,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import Modal from 'react-native-modal';

const UPLOAD_ENDPOINT = 'http://159.223.206.83:8080/upload-image';
const GET_IMAGES_ENDPOINT = 'http://159.223.206.83:8080/images';

const ImageUpload = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [savedImages, setSavedImages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const uploadImageToServer = async (imageUri) => {
    const uniqueName = `uploaded_image_${Date.now()}.jpg`;

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: uniqueName,
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post(
        UPLOAD_ENDPOINT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200 && response.data) {
        setUploadStatus('Image uploaded successfully');
        console.log('Image uploaded:', response.data);
      } else {
        setUploadStatus('Failed to upload image');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus('Error during upload');
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Camera and gallery permissions are required.');
      return false;
    }
    return true;
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

      if (result && !result.cancelled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        await uploadImageToServer(imageUri);
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
    }
  };

  const fetchSavedImages = async () => {
    try {
      const response = await axios.get(GET_IMAGES_ENDPOINT);
      if (response.status === 200 && response.data) {
        setSavedImages(response.data); // Update the state with the received data
        setIsModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to retrieve saved images');
      }
    } catch (error) {
      console.error('Error fetching saved images:', error);
      Alert.alert('Error', 'An error occurred while retrieving the saved images');
    }
  };

  const handleImagePress = async (imageId) => {
    try {
      const response = await axios.get(`http://159.223.206.83:8080/images/${imageId}`);
      if (response.status === 200 && response.data) {
        // Assuming the image data is in a field called 'imageUrl'
        const imageUrl = response.data.imageUrl;
        // Now you can do something with the image URL, like displaying it
        console.log('Image URL:', imageUrl);
        // For example, you can navigate to a detail screen and pass the image URL as a parameter
        navigation.navigate('ImageDetailScreen', { imageUrl });
      } else {
        Alert.alert('Error', 'Failed to fetch image');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      Alert.alert('Error', 'An error occurred while fetching the image');
    }
  };
  
  return (
    <ImageBackground
      source={{ uri: 'https://w0.peakpx.com/wallpaper/411/213/HD-wallpaper-cotton-candy-color-colors-pink-thumbnail.jpg' }}
      style={styles.background}
      resizeMode="cover"
    >
      <BlurView intensity={80} style={styles.blurView}>
        <SafeAreaView style={styles.container}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>No Image Uploaded</Text>
          )}

          {uploadStatus && (
            <Text style={styles.uploadStatus}>{uploadStatus}</Text>
          )}

          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.imagebuttons}
              onPress={() => uploadImage('camera')}
            >
              <FontAwesome5 name="camera" size={30} color="#000" />
              <Text style={styles.iconText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imagebuttons}
              onPress={() => uploadImage('gallery')}
            >
              <FontAwesome5 name="images" size={30} color="#000" />
              <Text style={styles.iconText}>Gallery</Text>
            </TouchableOpacity>

            {/* New Button to Show Saved Images */}
            <TouchableOpacity
              style={styles.imagebuttons}
              onPress={fetchSavedImages}
            >
              <FontAwesome5 name="folder-open" size={30} color="#000" />
              <Text style={styles.iconText}>Images</Text>
            </TouchableOpacity>
          </View>

          {/* Modal to Display Saved Images */}
          <Modal isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Saved Images</Text>
              <ScrollView>
                {savedImages.map((img) => (
                  <TouchableOpacity key={img._id} onPress={() => handleImagePress(img._id)}>
                    <Image source={{ uri: `http://159.223.206.83:8080/images/${img._id}` }} style={styles.savedImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Modal>

          <SafeAreaView style={styles.bottomContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('HomePage')}>
              <FontAwesome5 name="home" size={25} color="#000" />
              <Text style={styles.symboltext}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SearchingPage')}>
              <FontAwesome5 name="search" size={25} color="#000" />
              <Text style={styles.symboltext}>SearchPage</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ChatScreen')}>
              <FontAwesome5 name="comment" size={25} color="#000" />
              <Text style={styles.symboltext}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('LocationScreen')}>
              <FontAwesome5 name="map" size={25} color="#000" />
              <Text style={styles.symboltext}>Location</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  uploadStatus: {
    fontSize: 16,
    color: 'green',
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  imagebuttons: {
    backgroundColor: 'skyblue',
    alignItems: 'center',
    paddingHorizontal: 20,
    padding: 10,
    borderRadius: 20,  
  },
  iconText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
  },
  bottomContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '110%',
    height: '9%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    bottom: 0,
    backgroundColor: 'skyblue', // Changed from 'skyblue'
  },
  iconButton: {
    padding: 10, // Added padding for better touchability
    alignItems: 'center',
    bottom: 0,
    marginLeft: 20,
  },
  symboltext: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: 300,
    height: 500,
    borderRadius: 20,
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  savedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    margin: 7,
  },
});

export default ImageUpload;
