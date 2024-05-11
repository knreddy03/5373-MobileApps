import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';

const RegistrationPage = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (firstName === lastName) {
      Alert.alert("Error", "First name and last name cannot be the same.");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert("Error", "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending registration data:", {
        first: firstName,
        last: lastName,
        email,
        password,
      });

      const response = await fetch('http://159.223.206.83:8084/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first: firstName,
          last: lastName,
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          Alert.alert("Success", "User registered successfully!");
          navigation.navigate('LoginPage');
        } else {
          Alert.alert("Registration Error", data.message);
        }
      } else {
        // If response is not ok, handle the status code
        const errorText = await response.text();
        console.error("Server error:", errorText);
        Alert.alert("Error", `Registration failed: ${errorText}`);
      }

    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert("Error", `An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://w0.peakpx.com/wallpaper/411/213/HD-wallpaper-cotton-candy-color-colors-pink-thumbnail.jpg" }}
      style={styles.background}
      resizeMode="cover"
    >
      <BlurView intensity={50} style={styles.blurView}>
        <SafeAreaView style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <>
              <TextInput
                style={styles.input}
                onChangeText={setFirstName}
                value={firstName}
                placeholder="First Name"
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                onChangeText={setLastName}
                value={lastName}
                placeholder="Last Name"
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                onChangeText={setPassword}
                value={password}
                placeholder="Password"
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                placeholder="Confirm Password"
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
              >
                <Text style={styles.buttonText}>SIGN UP</Text>
              </TouchableOpacity>

              <SafeAreaView style={styles.registered}>
                <Text>Already registered?</Text>
                <Text
                  style={styles.textLogin}
                  onPress={() => navigation.navigate('LoginPage')}
                >
                  Click here
                </Text>
              </SafeAreaView>

              <SafeAreaView style={styles.bottomContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('HomePage')}>
                  <FontAwesome5 name="home" size={25} color="#000" />
                  <Text style={styles.symboltext}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('LoginPage')}>
                  <FontAwesome5 name="sign-in-alt" size={25} color="#000" />
                  <Text style={styles.symboltext}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('LandingPage')}>
                  <FontAwesome5 name="rocket" size={25} color="#000" />
                  <Text style={styles.symboltext}>Landing</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </>
          )}
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
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '85%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
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
  registered: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  textLogin: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  bottomContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '110%',
    height: '9%',
    alignItems: 'center',
    backgroundColor: 'skyblue',
    paddingHorizontal: 10,
    paddingVertical: 7,
    bottom: 0,
    
  },
  iconButton: {
    padding: 10,
    alignItems: 'center',
  },
  symboltext: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
});

export default RegistrationPage;