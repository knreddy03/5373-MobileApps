import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, Image, Modal, Button, TextInput, ScrollView, Linking, ImageBackground } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // Import icons from the FontAwesome5 icon library
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';


const SearchingPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [candies, setCandies] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCandies, setLoadingCandies] = useState(false);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorCandies, setErrorCandies] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const route = useRoute();
  const navigation = useNavigation();
  const userEmail = route.params?.userEmail; // Retrieve user email from the passed parameters
  
  // Fetch user details based on email
  const fetchUserDetails = async () => {
    if (userEmail) {
      try {
        const response = await fetch(`http://159.223.206.83:8084/user/${userEmail}`); // Sample endpoint
        const data = await response.json();
  
        if (response.ok) {
          setUserDetails(data); // Set user details
        } else {
          setError('Failed to fetch user details'); // Set error message
        }
      } catch (err) {
        setError(`Error: ${err.message}`); // Capture error
      }
    } else {
      setError('userEmail is not provided'); // No userEmail passed
    }
  };
  
  useEffect(() => {
    fetchUserDetails(); // Fetch user details on component mount
  }, []);
  

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('http://159.223.206.83:8084/categories');
        const data = await response.json();
        if (response.ok) {
          setCategories(data.data || []);
          setFilteredCategories(data.data || []); // Initialize filtered categories with all categories
          setErrorCategories(null);
        } else {
          setErrorCategories('Error fetching categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setErrorCategories('Error fetching categories');
      } finally {
        setLoadingCategories(false);
      }
    };
  
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchCandies = async () => {
      if (selectedCategory) {
        setLoadingCandies(true);
        try {
          const response = await fetch(`http://159.223.206.83:8084/candies/category/${selectedCategory}`);
          const data = await response.json();
          if (response.ok) {
            setCandies(data.data || []);
            setErrorCandies(null);
          } else {
            setErrorCandies('Error fetching candies');
          }
        } catch (error) {
          console.error('Error fetching candies:', error);
          setErrorCandies('Error fetching candies');
        } finally {
          setLoadingCandies(false);
        }
      }
    };
  
    fetchCandies();
  }, [selectedCategory]);

  
  const handleCategorySearch = (text) => {
    setSearchText(text);
    setShowDropdown(true);
    const filtered = categories.filter(category => category.name.toLowerCase().includes(text.toLowerCase()));
    setFilteredCategories(filtered);
  };

  const handleCategorySelection = async (category) => {
    setSelectedCategory(category);
    setModalVisible(false);
    setShowDropdown(false);
    setSearchText('');
    const response = await fetch(`http://159.223.206.83:8084/candies/category/${category}`);
    const data = await response.json();
    setCandies(data.data || []);
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const openProductLink = (url) => {
    Linking.openURL(url);
  };
  
  return (
    <ImageBackground
      source={{ uri: "https://w0.peakpx.com/wallpaper/411/213/HD-wallpaper-cotton-candy-color-colors-pink-thumbnail.jpg" }}
      style={styles.background}
      resizeMode="cover"
    >
    <BlurView intensity={80} style={styles.blurView}>
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity style={styles.icon}>
          <Image source={{ uri: "https://static.vecteezy.com/system/resources/previews/006/208/211/original/colorful-candy-shop-concept-logo-free-vector.jpg" }} style={styles.uri} />
        </TouchableOpacity>
        <View style={styles.searchBoxContainer}>
          <TextInput
            placeholder="Search category..."
            style={styles.searchBox}
            onChangeText={handleCategorySearch}
            value={searchText}
            autoCapitalize="none" // Set autoCapitalize to none
          />
          {showDropdown && (
            <SafeAreaView style={styles.dropdownContainer}>
              <ScrollView style={styles.categoryDropdown}>
                {filteredCategories.map(category => (
                  <TouchableOpacity key={category._id} style={styles.categoryItem} onPress={() => handleCategorySelection(category.name)}>
                    <Text>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
           </SafeAreaView>
          )}

        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {loadingCandies ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : errorCandies ? (
          <Text>{errorCandies}</Text>
        ) : (
          candies.map(candy => (
            <View key={candy._id} style={styles.candyContainer}>
              <Image source={{ uri: candy.img_url }} style={styles.candyImage} />
              <Text style={styles.candyName}>{candy.name}</Text>
              <TouchableOpacity onPress={() => openProductLink(candy.prod_url)}>
              <Text style={styles.candyLink}>{candy.prod_url}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <SafeAreaView style={styles.bottomContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('HomePage') }>
          <FontAwesome5 name="home" size={25} color="#000" />
          <Text style={styles.symboltext}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('LocationScreen', {email: userEmail, last: userDetails.last})}>
          <FontAwesome5 name="map" size={25} color="#000" />
          <Text style={styles.symboltext}>Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ChatScreen', {email: userEmail, last: userDetails.last})}>
          <FontAwesome5 name="comment" size={25} color="#000" />
          <Text style={styles.symboltext}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ImageUpload')}>
          <FontAwesome5 name="camera" size={25} color="#000" />
          <Text style={styles.symboltext}>Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={openModal}>
          <FontAwesome5 name="user" size={25} color="#000" />
          <Text style={styles.symboltext}>Profile</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <SafeAreaView style={styles.modalView}>
          {userDetails ? (
              <>
                <Text style={styles.UserText}>User Details</Text>
                <Text></Text>
                <Text style={styles.Text}>First Name: {userDetails.first}</Text>
                <Text style={styles.Text}>Last Name: {userDetails.last}</Text>
                <Text style={styles.Text}>Email: {userDetails.email}</Text>
                <Text></Text>
                <Button title="Close" onPress={closeModal} />
              </>
            ) : (
              <ActivityIndicator size="large" color="#0000ff" />
            )}
          </SafeAreaView>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topContainer: {
    position: 'absolute',
    backgroundColor: 'pink',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '110%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0,
    borderRadius: 20,
    top: 0,
  },
  dropdownContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  searchBox: {
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 20,
    marginLeft: 15,
    padding: 7,
    width: '80%',
  },
  categoryDropdown: {
    position: 'absolute',
    top: 60,
    marginLeft: 15,
    marginTop: 7,
    maxHeight: 200,
    width: '80%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  scrollView: {
    width: '100%',
    marginTop: 100,
    marginBottom: 80,
  },
  candyContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  candyName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  candyImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 5,
  },
  candyLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  bottomContainer: {
    position: 'absolute',
    backgroundColor: 'skyblue',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '110%',
    height: '9%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    bottom: 0,
  },
  iconButton: {
    padding: 10, // Added padding for better touchability
    alignItems: 'center',
    bottom: 0,
  },
  symboltext: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
  uri: {
    width: 50, 
    height: 50,
    marginLeft: 5,
    right: 15,
    borderRadius: 30,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "lightgreen",
    borderRadius: 25,
    padding: 35,
    alignItems: "left",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  UserText: {
    fontWeight: 'bold',
    fontSize: 17,
    textDecorationLine: 'underline',
  },
  Text:{
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SearchingPage;
