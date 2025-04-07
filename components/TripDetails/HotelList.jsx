import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Linking } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

// Add caching to prevent redundant API calls
const hotelImageCache = {};

// Default hotel image to use if we can't fetch one
const DEFAULT_HOTEL_IMAGE = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg';

const HotelList = ({ hotelList }) => {
  const [hotelImages, setHotelImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchingComplete, setFetchingComplete] = useState(false);

  useEffect(() => {
    // Only load images if we haven't already completed fetching
    if (fetchingComplete) return;
    
    const loadHotelImages = async () => {
      if (!hotelList || hotelList.length === 0) {
        setLoading(false);
        setFetchingComplete(true);
        return;
      }

      try {
        // Process only first 5 hotels to limit API calls
        const hotelsToProcess = hotelList.slice(0, 5);
        
        const imagePromises = hotelsToProcess.map(async (hotel) => {
          if (hotel.hotel_image_url) {
            return { hotelName: hotel.hotel_name, imageUrl: hotel.hotel_image_url };
          }
          
          // Check cache first
          if (hotelImageCache[hotel.hotel_name]) {
            return { hotelName: hotel.hotel_name, imageUrl: hotelImageCache[hotel.hotel_name] };
          }
          
          const imageUrl = await fetchImageFromPexels(hotel.hotel_name);
          
          // Save to cache
          if (imageUrl) {
            hotelImageCache[hotel.hotel_name] = imageUrl;
          }
          
          return { hotelName: hotel.hotel_name, imageUrl };
        });

        const results = await Promise.all(imagePromises);
        const imagesMap = {};
        results.forEach(result => {
          if (result.imageUrl) {
            imagesMap[result.hotelName] = result.imageUrl;
          }
        });

        setHotelImages(imagesMap);
      } catch (error) {
        console.error('Error loading hotel images:', error);
      } finally {
        setLoading(false);
        setFetchingComplete(true);
      }
    };

    loadHotelImages();
  }, [hotelList, fetchingComplete]);

  const fetchImageFromPexels = async (searchTerm) => {
    if (!searchTerm) return null;
    
    const apiKey = 'imY45DES967sZGy0D3e3wz8XAx6iNXvIzdbzmzDSlQPr5OmZlhNtMedH'; // Pexels API key
    try {
      const response = await axios.get("https://api.pexels.com/v1/search", {
        headers: {
          'Authorization': apiKey
        },
        params: {
          query: `${searchTerm} hotel`,
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

  if (!hotelList || hotelList.length === 0) {
    return (
      <View style={styles.noHotelsContainer}>
        <Ionicons name="bed-outline" size={40} color="#E2E8F0" />
        <Text style={styles.noHotelsText}>No hotel options available</Text>
        <Text style={styles.noHotelsSubtext}>Accommodation information will appear here</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="bed-outline" size={40} color="#E2E8F0" />
        <Text style={styles.loadingText}>Loading hotel options...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      style={styles.container}
      showsHorizontalScrollIndicator={false}
    >
      {hotelList.map((hotel, index) => {
        if (!hotel || !hotel.hotel_name) return null;
        
        return (
          <View key={index} style={styles.hotelCard}>
            <Image
              source={{
                uri: hotelImages[hotel.hotel_name] || DEFAULT_HOTEL_IMAGE,
              }}
              style={styles.hotelImage}
            />
            
            <View style={styles.hotelContent}>
              <Text style={styles.hotelName} numberOfLines={2}>
                {hotel.hotel_name}
              </Text>
              
              <Text style={styles.hotelAddress} numberOfLines={2}>
                <Ionicons name="location-outline" size={14} color="#718096" />
                {' ' + (hotel.hotel_address || 'Address not available')}
              </Text>
              
              <View style={styles.hotelFeatures}>
                <View style={styles.hotelFeature}>
                  <Text style={styles.featureText}>{hotel.rating || '0'}</Text>
                  <View style={styles.ratingStars}>
                    {Array(Math.floor(parseFloat(hotel.rating) || 0)).fill().map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color="#FBBF24" />
                    ))}
                  </View>
                </View>
                
                {hotel.amenities && (
                  <View style={styles.hotelFeature}>
                    <Text style={styles.featureLabel}>
                      <Ionicons name="wifi-outline" size={14} color="#718096" /> WiFi
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.priceBookingContainer}>
                <Text style={styles.price}>{hotel.price || 'Price not available'}</Text>
                
                {hotel.booking_url && (
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookHotel(hotel.booking_url)}
                  >
                    <Text style={styles.bookButtonText}>Book Room</Text>
                    <Ionicons name="open-outline" size={16} color="white" style={styles.bookIcon} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const handleBookHotel = (bookingUrl) => {
  if (bookingUrl) {
    Linking.openURL(bookingUrl).catch(err => 
      console.error('Error opening booking URL:', err)
    );
  } else {
    // Handle case where booking URL isn't available
    console.log('No booking URL available');
  }
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 40,
    marginTop: 12,
  },
  loadingText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#718096',
    marginTop: 12,
  },
  hotelCard: {
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    width: windowWidth * 0.8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  hotelImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  hotelContent: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  hotelAddress: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#718096',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelFeatures: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  hotelFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: '#4A5568',
    marginRight: 4,
  },
  featureLabel: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#718096',
  },
  ratingStars: {
    flexDirection: 'row',
  },
  priceBookingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: '#4F46E5',
  },
  bookButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: 'outfit-bold',
    color: '#FFFFFF',
  },
  bookIcon: {
    marginLeft: 4,
  },
  noHotelsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 40,
    marginTop: 12,
  },
  noHotelsText: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: '#4A5568',
    marginTop: 12,
  },
  noHotelsSubtext: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#718096',
    marginTop: 4,
  },
});

export default HotelList;
