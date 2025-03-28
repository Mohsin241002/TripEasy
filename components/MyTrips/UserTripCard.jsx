import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import axios from 'axios';
import { useRouter } from 'expo-router';


// Function to fetch image URL from Pexels
const fetchImage = async (locationName) => {
  const apiKey = 'imY45DES967sZGy0D3e3wz8XAx6iNXvIzdbzmzDSlQPr5OmZlhNtMedH'; // Pexels API key
  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        'Authorization': apiKey
      },
      params: {
        query: locationName,
        per_page: 1
      },
    });
    return response.data.photos && response.data.photos.length > 0 
      ? response.data.photos[0].src.large 
      : null;
  } catch (error) {
    console.error("Error fetching image from Pexels:", error);
    return null;
  }
};

const UserTripCard = ({ trip }) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const router = useRouter();

  if (!trip) {
    console.error('Trip data is missing');
    return null;
  }

  let tripData;

  // Safely parse tripData
  try {
    tripData = typeof trip.tripData === 'string' ? JSON.parse(trip.tripData) : trip.tripData;
  } catch (error) {
    console.error('Failed to parse trip data:', error);
    return null;
  }

  useEffect(() => {
    const fetchPhoto = async () => {
      if (tripData?.locationInfo?.name) {
        const url = await fetchImage(tripData.locationInfo.name.trim());
        setPhotoUrl(url);
      }
    };
    fetchPhoto();
  }, [tripData?.locationInfo?.name]);

  const handlePress = () => {
    console.log("Trip data before navigation:", JSON.stringify(trip, null, 2));
    router.push({
      pathname: '/trip-detail',
      params: { trip: JSON.stringify(trip) }
    });
  };
  
  if (!tripData || !tripData.locationInfo) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress}>
      <Image
        source={photoUrl ? { uri: photoUrl } : require('./../../assets/images/pl.jpg')}
        style={styles.cardImage}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardLocation}>
          🌍 {tripData.locationInfo.name.trim()}
        </Text>
        <Text style={styles.cardDate}>
          📅 {moment(trip.startDate).format('MMM Do YYYY')} - {moment(trip.endDate).format('MMM Do YYYY')}
        </Text>
        <Text style={styles.cardBudget}>
          💸 Budget: {tripData.budget}
        </Text>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>See Your Plans</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardInfo: {
    padding: 16,
  },
  cardLocation: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDate: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  cardBudget: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default UserTripCard;