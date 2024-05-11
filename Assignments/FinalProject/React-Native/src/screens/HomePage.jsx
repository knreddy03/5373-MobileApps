import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Image, ImageBackground } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';


const LandingPage = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: "https://w0.peakpx.com/wallpaper/411/213/HD-wallpaper-cotton-candy-color-colors-pink-thumbnail.jpg" }}
      style={styles.background}
      resizeMode="cover"
    >
      <BlurView intensity={80} style={styles.blurView}>
      <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.logoContainer}>
        <Image
          source={{
            uri: "https://static.vecteezy.com/system/resources/previews/006/208/211/original/colorful-candy-shop-concept-logo-free-vector.jpg"
          }} // Provide the correct relative path to the image
          style={styles.logo}
        />
      </SafeAreaView>
      <SafeAreaView style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LandingPage')}
        >
          <FontAwesome5 name="rocket" size={20} color="white" />
          <Text style={styles.buttonText}>Main</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RegistrationPage')}
        >
          <FontAwesome5 name="user-plus" size={20} color="white" />
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LoginPage')}
        >
          <FontAwesome5 name="sign-in-alt" size={20} color="white" />
          <Text style={styles.buttonText}>Login</Text>
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
    ...StyleSheet.absoluteFillObject, // Ensures blur effect covers the entire screen
  },
  container: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'top',
  },
  logoContainer: {
    marginTop: 110,
    marginBottom: 80,
    alignItems: 'center',
  },
  logo: {
    width: 250, // Adjust width and height as needed
    height: 250,
    borderRadius: 200,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row', // Horizontal placement of buttons
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    alignItems: 'center',
    paddingHorizontal: 30,
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
});

export default LandingPage;
