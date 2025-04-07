import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const apiKey = 'imY45DES967sZGy0D3e3wz8XAx6iNXvIzdbzmzDSlQPr5OmZlhNtMedH'; // Pexels API key

// Memoize image fetching to prevent redundant calls
const fetchedImages = {};

const fetchActivityImage = async (activity) => {
  // If this activity's image was already fetched, return it from cache
  const cacheKey = activity?.substring(0, 30);
  if (fetchedImages[cacheKey]) {
    return fetchedImages[cacheKey];
  }

  try {
    // Clean up the activity text to create a better search query
    const searchQuery = activity
      ?.split(' ')
      ?.slice(0, 3)
      ?.join(' ')
      ?.replace(/[^\w\s]/gi, '') || 'travel';

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

    const imageUrl = response.data.photos && response.data.photos.length > 0 
      ? response.data.photos[0].src.large 
      : null;
    
    // Cache the result
    if (imageUrl) {
      fetchedImages[cacheKey] = imageUrl;
    }
    
    return imageUrl;
  } catch (error) {
    console.error("Error fetching image from Pexels:", error.response ? error.response.data : error.message);
    return null;
  }
};

const PlanTrip = ({ details }) => {
  if (!details) {
    return (
      <View style={styles.noItineraryContainer}>
        <Ionicons name="calendar-outline" size={40} color="#E2E8F0" />
        <Text style={styles.noItineraryText}>No itinerary available</Text>
        <Text style={styles.noItinerarySubtext}>Your daily plan will appear here</Text>
      </View>
    );
  }

  const sortedDays = Object.keys(details).sort((a, b) => {
    const dayA = parseInt(a.replace('day', ''));
    const dayB = parseInt(b.replace('day', ''));
    return dayA - dayB;
  });

  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchingComplete, setFetchingComplete] = useState(false);

  useEffect(() => {
    // Only fetch images if we haven't completed fetching before
    if (fetchingComplete) return;
    
    const fetchImages = async () => {
      setLoading(true);
      const newImages = {};
      
      try {
        // Fetch images for all days, not just the first 3
        const daysToFetch = sortedDays;
        
        // To avoid too many simultaneous requests, process in batches
        const batchSize = 3;
        for (let i = 0; i < daysToFetch.length; i += batchSize) {
          const batch = daysToFetch.slice(i, i + batchSize);
          
          // Process each batch in parallel
          const batchPromises = batch.map(async (dayKey) => {
            const dayDetails = details[dayKey];
            if (!dayDetails) return null;
            
            const activity = Array.isArray(dayDetails.activity) 
              ? dayDetails.activity[0] 
              : dayDetails.activity;
            
            if (!activity) return null;
            
            try {
              const imageUrl = await fetchActivityImage(activity);
              if (imageUrl) {
                return { dayKey, imageUrl };
              }
            } catch (error) {
              console.error(`Error fetching image for ${dayKey}:`, error);
            }
            return null;
          });
          
          // Wait for current batch to complete
          const batchResults = await Promise.all(batchPromises);
          
          // Add successful results to images object
          batchResults.forEach(result => {
            if (result) {
              newImages[result.dayKey] = result.imageUrl;
            }
          });
          
          // Small delay between batches to avoid rate limiting
          if (i + batchSize < daysToFetch.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      } catch (error) {
        console.error("Error fetching activity images:", error);
      } finally {
        setImages(newImages);
        setLoading(false);
        setFetchingComplete(true);
      }
    };
    
    fetchImages();
  }, [details, fetchingComplete]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your itinerary...</Text>
      </View>
    );
  }

  if (sortedDays.length === 0) {
    return (
      <View style={styles.noItineraryContainer}>
        <Ionicons name="calendar-outline" size={40} color="#E2E8F0" />
        <Text style={styles.noItineraryText}>No itinerary available</Text>
        <Text style={styles.noItinerarySubtext}>Your daily plan will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sortedDays.map((dayKey) => {
        const dayDetails = details[dayKey];
        if (!dayDetails) return null;
        
        const activities = Array.isArray(dayDetails.activity) 
          ? dayDetails.activity 
          : [dayDetails.activity];
        const times = Array.isArray(dayDetails.time) 
          ? dayDetails.time 
          : [dayDetails.time];

        // Format day number for display
        const dayNumber = dayKey.replace('day', '').trim();

        return (
          <View key={dayKey} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayNumber}>{dayNumber}</Text>
              </View>
              <Text style={styles.dayTitle}>Day {dayNumber}</Text>
            </View>
            
            {images[dayKey] ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: images[dayKey] }} style={styles.activityImage} />
                <View style={styles.imageFade} />
              </View>
            ) : null}
            
            <View style={styles.activitiesList}>
              {activities.map((activity, index) => (
                <View key={index} style={styles.activityContainer}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{times[index] || 'Anytime'}</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{activity}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#718096',
    marginTop: 12,
  },
  noItineraryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 40,
    marginTop: 12,
  },
  noItineraryText: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: '#4A5568',
    marginTop: 12,
  },
  noItinerarySubtext: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  dayContainer: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dayBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dayNumber: {
    fontFamily: 'outfit-bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  dayTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: '#2D3748',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  activityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  activitiesList: {
    padding: 16,
  },
  activityContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 12,
  },
  timeContainer: {
    width: 80,
  },
  timeText: {
    fontFamily: 'outfit-medium',
    fontSize: 14,
    color: '#4F46E5',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 22,
  },
});

export default PlanTrip;