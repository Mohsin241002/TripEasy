import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiKey = 'imY45DES967sZGy0D3e3wz8XAx6iNXvIzdbzmzDSlQPr5OmZlhNtMedH'; // Pexels API key

const fetchActivityImage = async (activity) => {
  try {
    // Clean up the activity text to create a better search query
    const searchQuery = activity
      .split(' ')
      .slice(0, 3)
      .join(' ')
      .replace(/[^\w\s]/gi, '');

    if (!searchQuery) return null;

    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        'Authorization': apiKey
      },
      params: {
        query: searchQuery,
        per_page: 1
      },
    });

    return response.data.photos && response.data.photos.length > 0 
      ? response.data.photos[0].src.large 
      : null;
  } catch (error) {
    console.error("Error fetching image from Pexels:", error.response ? error.response.data : error.message);
    return null;
  }
};

const PlanTrip = ({ details }) => {
  if (!details) {
    return null;
  }

  const sortedDays = Object.keys(details).sort((a, b) => {
    const dayA = parseInt(a.replace('day', ''));
    const dayB = parseInt(b.replace('day', ''));
    return dayA - dayB;
  });

  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const newImages = {};
      for (const dayKey of sortedDays) {
        const dayDetails = details[dayKey];
        const activity = Array.isArray(dayDetails.activity) ? dayDetails.activity[0] : dayDetails.activity;
        const imageUrl = await fetchActivityImage(activity);
        newImages[dayKey] = imageUrl;
      }
      setImages(newImages);
      setLoading(false);
    };
    fetchImages();
  }, [details]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sortedDays.map((dayKey) => {
        const dayDetails = details[dayKey];
        const activities = Array.isArray(dayDetails.activity) ? dayDetails.activity : [dayDetails.activity];
        const times = Array.isArray(dayDetails.time) ? dayDetails.time : [dayDetails.time];

        return (
          <View key={dayKey} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{dayKey.toUpperCase()}</Text>
            {images[dayKey] ? (
              <Image source={{ uri: images[dayKey] }} style={styles.activityImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Image not available</Text>
              </View>
            )}
            {activities.map((activity, index) => (
              <View key={index} style={styles.activityContainer}>
                <Text style={styles.timeText}>{times[index]}</Text>
                <Text style={styles.activityText}>{activity}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  dayContainer: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  activityContainer: {
    marginTop: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
  },
  activityImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#555',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlanTrip;