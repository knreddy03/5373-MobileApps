import React, { useState } from 'react';
import {
  ImageBackground,
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';

const LoginPage = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateInput = () => {
    if (!email || !validateEmail(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Password must not be empty.');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) {
      return;
    }

    try {
      const response = await fetch('http://159.223.206.83:8084/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Keyboard.dismiss(); // Dismiss keyboard on successful login
        setEmail('');
        setPassword('');
        navigation.navigate('SearchingPage', { userEmail: email });
      } else {
        Alert.alert('Login Failed', data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
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
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={(text) => setEmail(text.trim())}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>

          <View style={styles.register}>
            <Text>Need to register?</Text>
            <Text
              style={styles.textRegister}
              onPress={() => navigation.navigate('RegistrationPage')}
            >
              Click here
            </Text>
          </View>

          <BottomNavigation navigation={navigation} />
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
};

const BottomNavigation = ({ navigation }) => (
  <View style={styles.bottomContainer}>
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => navigation.navigate('HomePage')}
      accessible
      accessibilityLabel="Go to home page"
    >
      <FontAwesome5 name="home" size={25} color="#000" />
      <Text style={styles.symboltext}>Home</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => navigation.navigate('RegistrationPage')}
      accessible
      accessibilityLabel="Go to registration page"
    >
      <FontAwesome5 name="user-plus" size={25} color="#000" />
      <Text style={styles.symboltext}>Sign Up</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => navigation.navigate('LandingPage')}
      accessible
      accessibilityLabel="Go to landing page"
    >
      <FontAwesome5 name="rocket" size={25} color="#000" />
      <Text style={styles.symboltext}>Landing</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject, // Ensures blur effect covers the entire screen
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '30%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  register: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15, // Added margin for separation
  },
  textRegister: {
    color: '#007bff',
    fontWeight: 'bold',
    marginLeft: 5, // Adds space between "Need to register?" and "Click here"
  },
  bottomContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '9%',
    alignItems: 'center',
    backgroundColor: 'skyblue',
    paddingHorizontal: 10,
    bottom: 0,
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
    bottom: 0,
  },
  symboltext: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
});

export default LoginPage;
