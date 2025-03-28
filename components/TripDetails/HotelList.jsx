import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;

const HotelList = ({ hotelList }) => {
  const [hotelImages, setHotelImages] = useState({});

  useEffect(() => {
    const loadHotelImages = async () => {
      if (!hotelList) return;

      for (const hotel of hotelList) {
        if (!hotel.hotel_image_url) {
          const imageUrl = await fetchImageFromPexels(hotel.hotel_name);
          if (imageUrl) {
            setHotelImages(prev => ({
              ...prev,
              [hotel.hotel_name]: imageUrl
            }));
          }
        }
      }
    };

    loadHotelImages();
  }, [hotelList]);

  const fetchImageFromPexels = async (searchTerm) => {
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
        <Text style={styles.noHotelsText}>No hotel details available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      style={styles.container}
      showsHorizontalScrollIndicator={false}
    >
      {hotelList.map((hotel, index) => (
        <TouchableOpacity
          key={index}
          style={styles.hotelCard}
          onPress={() => handlePressHotel(hotel)}
        >
          <Image
            source={{
              uri:
                hotelImages[hotel.hotel_name] ||
                'https://via.placeholder.com/400x300.png?text=Image+Not+Found',
            }}
            style={styles.hotelImage}
          />
          <View style={styles.hotelDetails}>
            <Text style={styles.hotelName} numberOfLines={3}>
              {hotel.hotel_name}
            </Text>
            <Text style={styles.hotelAddress} numberOfLines={2}>
              {hotel.hotel_address}
            </Text>
            <Text style={styles.hotelPrice}>💰 {hotel.price}</Text>
            <Text style={styles.hotelRating}>{hotel.rating} ⭐ </Text>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookHotel(hotel.booking_url)}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const handlePressHotel = (hotel) => {
  // Handle press action for hotel card, e.g., navigate to hotel details screen
  console.log('Pressed hotel:', hotel);
};

const handleBookHotel = (bookingUrl) => {
  // Handle booking logic, e.g., open a web browser or navigate to the booking URL
  console.log('Booking hotel:', bookingUrl);
  // Example: window.open(bookingUrl, '_blank'); // For web-based applications
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16, // Add horizontal padding to avoid content touching edges
  },
  hotelCard: {
    backgroundColor: '#fff',
    marginRight: 16, // Add margin to separate hotel cards
    width: windowWidth * 0.7, // Adjust width according to your design needs
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  hotelImage: {
    width: 120, // Adjust the width according to your design needs
    height: '100%', // Maintain aspect ratio
    resizeMode: 'cover',
  },
  hotelDetails: {
    flex: 1,
    padding: 16,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hotelAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  hotelDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  hotelPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  hotelRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  noHotelsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  noHotelsText: {
    fontSize: 16,
    color: '#555',
  },
});

export default HotelList;
