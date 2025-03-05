import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, FlatList, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../../configs/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import WebDashboardLayout from './WebDashboardLayout';
import axios from 'axios';
import moment from 'moment';

const fetchImage = async (locationName) => {
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

export default function WebMyTrips() {
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tripImages, setTripImages] = useState({});
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      getMyTrips();
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
        const tripData = JSON.parse(trip.tripData);
        const locationName = tripData.locationInfo.name;
        const imageUrl = await fetchImage(locationName);
        return { tripId: trip.id, imageUrl };
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewTrip = () => {
    router.push('../web/create-trip');
  };

  const handleTripPress = (trip) => {
    router.push({
      pathname: '../web/trip-detail',
      params: { id: trip.id }
    });
  };

  const renderTripCard = ({ item }) => {
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
          <Text style={styles.tripDestination}>{locationInfo.name}</Text>
          <Text style={styles.tripDates}>
            {moment(startDate).format('MMM D')} - {moment(endDate).format('MMM D, YYYY')}
          </Text>
          <View style={styles.tripDetails}>
            <View style={styles.tripDetail}>
              <Ionicons name="cash-outline" size={16} color="#718096" />
              <Text style={styles.tripDetailText}>Budget: ${budget}</Text>
            </View>
            <View style={styles.tripDetail}>
              <Ionicons name="location-outline" size={16} color="#718096" />
              <Text style={styles.tripDetailText}>{locationInfo.country}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <WebDashboardLayout title="My Trips">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Manage your travel plans</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddNewTrip}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Create New Trip</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4B4B" />
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
            numColumns={Platform.OS === 'web' ? 2 : 1}
            columnWrapperStyle={Platform.OS === 'web' ? styles.tripGrid : null}
          />
        )}
      </View>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    color: '#718096',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4B4B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  tripList: {
    paddingBottom: 20,
  },
  tripGrid: {
    justifyContent: 'space-between',
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    width: Platform.OS === 'web' ? 'calc(50% - 10px)' : '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      },
    } : {}),
  },
  tripImageContainer: {
    height: 200,
    backgroundColor: '#F7FAFC',
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
    padding: 20,
  },
  tripDestination: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  tripDates: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 16,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDetailText: {
    fontSize: 14,
    color: '#718096',
  },
}); 