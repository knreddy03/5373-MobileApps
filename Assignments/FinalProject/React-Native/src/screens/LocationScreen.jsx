import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, TextInput, openModal } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { haversineDistance } from '../utils/haversineDistance';

const POST_LOCATION_ENDPOINT = 'http://159.223.206.83:8084/post-location';
const FETCH_LOCATIONS_ENDPOINT = 'http://159.223.206.83:8084/locations';
const USER_API_ENDPOINT = 'http://159.223.206.83:8084/users';

const LocationScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherLocations, setOtherLocations] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(0.0922); // Initial zoom level
  
  const route = useRoute();
  const navigation = useNavigation();
  const email = route.params?.email;

  // Initialize mapRegion with a default location
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.7749, // Default value
    longitude: -122.4194,
    latitudeDelta: zoomLevel,
    longitudeDelta: zoomLevel,
  });

  const [searchText, setSearchText] = useState(''); // For search functionality

  const postUserLocation = async (location) => {
    try {
      const response = await fetch(POST_LOCATION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString(), // Add timestamp
        }),
      });

      if (!response.ok) {
        const responseText = await response.text(); // Capture server error
        throw new Error(`Failed to post location: ${responseText}`);
      }
    } catch (error) {
      console.error("Error posting location:", error);
      Alert.alert('Error', `Failed to post location: ${error.message}`);
    }
  };

  const fetchAllLocations = async () => {
    try {
      const response = await fetch(FETCH_LOCATIONS_ENDPOINT);
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.statusText}`); // Corrected syntax
      }
      const locationsData = await response.json();
  
      const userResponse = await fetch(USER_API_ENDPOINT);
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.statusText}`); // Corrected syntax
      }
  
      const userData = await userResponse.json();
  
      const emailToUserMap = userData.reduce((map, user) => {
        map[user.email] = user;
        return map;
      }, {});
  
      const combinedData = locationsData.map((loc) => {
        const user = emailToUserMap[loc.email];
        return {
          latitude: loc.location.coordinates[1],
          longitude: loc.location.coordinates[0],
          first: user?.first || "Unknown",
          last: user?.last || "",
        };
      });
  
      setOtherLocations(combinedData);
    } catch (error) {
      console.error("Error fetching locations:", error);
      Alert.alert('Error', `Failed to fetch locations: ${error.message}`);
    }
  };
  
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permission to access location was denied');
        }

        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation(loc);

        setMapRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: zoomLevel,
          longitudeDelta: zoomLevel,
        });

        await postUserLocation(loc);
        await fetchAllLocations();
      } catch (error) {
        console.error("Error fetching location data:", error);
        Alert.alert('Error', `Failed to fetch location data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData(); // Fetch data when the component mounts
  }, []);

  const moveToCurrentLocation = () => {
    if (currentLocation) {
      const newZoom = Math.max(zoomLevel - 0.01, 0.01); // Adjust zoom
      setZoomLevel(newZoom); // Update zoom level
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: newZoom,
        longitudeDelta: newZoom,
      });
    }
  };

  const calculateDistance = (userLocation) => {
    if (currentLocation) {
      const currentCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      return haversineDistance(currentCoords, userLocation); // Calculate distance
    }
    return null;
  };

  const handleSearch = () => {
    const searchTerm = searchText.trim().toLowerCase();

    const targetLocation = otherLocations.find(
      (loc) => 
        loc.first.toLowerCase().includes(searchTerm) || 
        loc.last.toLowerCase().includes(searchTerm)
    );

    if (targetLocation) {
      setMapRegion({
        latitude: targetLocation.latitude,
        longitude: targetLocation.longitude,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      });
    } else {
      Alert.alert("No results", `No location found for ${searchTerm}`);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by first or last name"
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={(region) => setMapRegion(region)}
          >
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                }}
                title="Your Location"
                pinColor="blue" // Color to distinguish
              />
            )}

            {otherLocations.map((loc, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
              >
                <Callout>
                  <Text>{`${loc.first} ${loc.last}`}</Text>
                  {currentLocation && (
                    <Text>
                      Distance: {calculateDistance(loc).toFixed(2)} km
                    </Text>
                  )}
                </Callout>
              </Marker>
            ))}
          </MapView>

        <SafeAreaView style={styles.bottomContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('HomePage') }>
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

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ImageUpload')}>
          <FontAwesome5 name="camera" size={25} color="#000" />
          <Text style={styles.symboltext}>Image</Text>
        </TouchableOpacity>

      </SafeAreaView>

          <TouchableOpacity style={styles.floatButton} onPress={moveToCurrentLocation}>
            <MaterialIcons name="my-location" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  searchInput: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  floatButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: 'blue', // Distinct button color
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginLeft: 20,
    marginRight: 20,
  },
  symboltext: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
});

export default LocationScreen;
