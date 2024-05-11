import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const LandingPage = () => {
  const navigation = useNavigation();
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    // Automatically navigate to the homepage after 3 seconds
    const timeout = setTimeout(() => {
      navigation.navigate('HomePage');
    }, 1000);

    setTimer(timeout);

    // Cleanup the timer when the component is unmounted
    return () => clearTimeout(timeout);
  }, [navigation]);

  const cancelAndNavigate = () => {
    if (timer) {
      clearTimeout(timer);
    }
    navigation.navigate('HomePage');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://w0.peakpx.com/wallpaper/411/213/HD-wallpaper-cotton-candy-color-colors-pink-thumbnail.jpg' }}
      style={styles.background}
      resizeMode="cover"
    >
      <BlurView intensity={80} style={styles.blurView}>
        <SafeAreaView style={styles.container}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcome}>🍭 Welcome to Candy Shop! 🍬</Text>
          </View>

          <SafeAreaView style={styles.imageContainer}>
            <Image
              source={{
                uri: 'https://static.vecteezy.com/system/resources/previews/006/208/211/original/colorful-candy-shop-concept-logo-free-vector.jpg',
              }}
              style={styles.image}
            />
          </SafeAreaView>

          <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  welcomeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    padding: 10,
    borderRadius: 10,
    Top: 30,
    marginBottom: 50,
  },
  welcome: {
    fontWeight: 'bold',
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 100,
    resizeMode: 'contain',
  },
  spinner: {
    marginTop: 20,
  },
});

export default LandingPage;
