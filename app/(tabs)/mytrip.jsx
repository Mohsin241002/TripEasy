import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './../../configs/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import axios from 'axios';
import moment from 'moment';

const fetchImage = async (locationName) => {
  if (!locationName) return null;
  
  const apiKey = '44938756-d9d562ffdaf712150c470c59e'; // Pixabay API key
  try {
    const response = await axios.get("https://pixabay.com/api/", {
      params: {
        key: apiKey,
        q: locationName,
        image_type: 'photo',
      },
    });
    return response.data.hits[0]?.largeImageURL || null;
  } catch (error) {
    console.error("Error fetching image from Pixabay:", error);
    return null;
  }
};

export default function MyTrip() {
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripImages, setTripImages] = useState({});
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      getMyTrips();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getMyTrips = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'UserTrips'), where('userEmail', '==', user?.email));
      const querySnapshot = await getDocs(q);

      const trips = [];
      querySnapshot.forEach((doc) => {
        trips.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setUserTrips(trips);
      
      // Fetch images for each trip
      const imagePromises = trips.map(async (trip) => {
        try {
          const tripData = JSON.parse(trip.tripData);
          const locationName = tripData.locationInfo.name;
          const imageUrl = await fetchImage(locationName);
          return { tripId: trip.id, imageUrl };
        } catch (error) {
          console.error("Error processing trip data:", error);
          return { tripId: trip.id, imageUrl: null };
        }
      });

      const images = await Promise.all(imagePromises);
      const imageMap = {};
      images.forEach(item => {
        if (item.imageUrl) {
          imageMap[item.tripId] = item.imageUrl;
        }
      });

      setTripImages(imageMap);
    } catch (error) {
      console.error('Error fetching trips:', error);
      Alert.alert('Error', 'Failed to load your trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewTrip = () => {
    router.push('/create-trip/search-place');
  };

  const handleTripPress = (trip) => {
    router.push({
      pathname: '/trip-detail',
      params: { id: trip.id }
    });
  };

  const renderTripCard = ({ item }) => {
    try {
      const tripData = JSON.parse(item.tripData);
      const { locationInfo, startDate, endDate, budget } = tripData;
      const imageUrl = tripImages[item.id];
      
      return (
        <TouchableOpacity 
          style={styles.tripCard}
          onPress={() => handleTripPress(item)}
        >
          <View style={styles.tripImageContainer}>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.tripImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={40} color="#CBD5E0" />
              </View>
            )}
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.tripDestination}>{locationInfo?.name || "Unknown Location"}</Text>
            <Text style={styles.tripDates}>
              {moment(startDate).format('MMM D')} - {moment(endDate).format('MMM D, YYYY')}
            </Text>
            <View style={styles.tripDetails}>
              <View style={styles.tripDetail}>
                <Ionicons name="cash-outline" size={16} color="#718096" />
                <Text style={styles.tripDetailText}>Budget: ${budget || 'N/A'}</Text>
              </View>
              <View style={styles.tripDetail}>
                <Ionicons name="location-outline" size={16} color="#718096" />
                <Text style={styles.tripDetailText}>{locationInfo?.country || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error("Error rendering trip card:", error);
      return (
        <TouchableOpacity 
          style={styles.errorTripCard}
          onPress={() => handleTripPress(item)}
        >
          <Ionicons name="alert-circle-outline" size={24} color="#CBD5E0" />
          <Text style={styles.errorTripText}>This trip data is corrupted</Text>
        </TouchableOpacity>
      );
    }
  };

  if (!user) {
    return (
      <View style={styles.notSignedInContainer}>
        <Ionicons name="airplane-outline" size={80} color="#CBD5E0" />
        <Text style={styles.notSignedInTitle}>Sign In to View Your Trips</Text>
        <Text style={styles.notSignedInText}>
          Please sign in to create and view your travel plans
        </Text>
        <TouchableOpacity 
          style={styles.signInButton} 
          onPress={() => router.replace('/auth/sign-in')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
        <TouchableOpacity 
          style={styles.createTripButton}
          onPress={() => router.push('/create-trip/search-place')}
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.createTripButtonText}>Create New Trip</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      ) : userTrips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="airplane-outline" size={80} color="#CBD5E0" />
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptyText}>
            Start planning your next adventure by creating a new trip.
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleAddNewTrip}
          >
            <Text style={styles.startButtonText}>Start Planning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={userTrips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tripList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 28,
    color: '#2D3748',
  },
  createTripButton: {
    backgroundColor: '#FF5A5F',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  createTripButtonText: {
    fontFamily: 'outfit-medium',
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'outfit',
    color: '#4A5568',
    fontSize: 16,
    marginTop: 16,
  },
  notSignedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  notSignedInTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  notSignedInText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  signInButtonText: {
    fontFamily: 'outfit-medium',
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  startButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startButtonText: {
    fontFamily: 'outfit-medium',
    color: '#FFFFFF',
    fontSize: 16,
  },
  tripList: {
    paddingBottom: 20,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripImageContainer: {
    height: 150,
    backgroundColor: '#E2E8F0',
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
  },
  tripInfo: {
    padding: 16,
  },
  tripDestination: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: '#2D3748',
    marginBottom: 4,
  },
  tripDates: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 12,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripDetailText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
  errorTripCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  errorTripText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: '#E53E3E',
    marginLeft: 8,
  },
  viewDetailsButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
