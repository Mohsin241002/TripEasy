import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';
import WebDashboardLayout from './WebDashboardLayout';

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

export default function WebTripDetail({ trip }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Parse trip data
  const tripData = typeof trip.tripData === 'string' ? JSON.parse(trip.tripData) : trip.tripData;
  const { locationInfo, startDate, endDate, budget, travelers, itinerary, hotels, flights } = tripData;

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      try {
        const url = await fetchImage(`${locationInfo.name} ${locationInfo.country} travel`);
        setImageUrl(url);
      } catch (error) {
        console.error('Error loading image:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [locationInfo]);

  const handleBackPress = () => {
    router.push('../web/mytrips');
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('MMM D, YYYY');
  };

  const renderFlightInfo = () => {
    if (!flights || !flights.length) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No flight information available</Text>
        </View>
      );
    }

    return (
      <View style={styles.flightContainer}>
        {flights.map((flight, index) => (
          <View key={index} style={styles.flightCard}>
            <View style={styles.flightHeader}>
              <Text style={styles.flightType}>
                {flight.type === 'departure' ? 'Departure Flight' : 'Return Flight'}
              </Text>
              <Text style={styles.flightDate}>{formatDate(flight.date)}</Text>
            </View>
            <View style={styles.flightDetails}>
              <View style={styles.flightLocation}>
                <Text style={styles.flightCity}>{flight.from}</Text>
                <Text style={styles.flightTime}>{flight.departureTime}</Text>
              </View>
              <View style={styles.flightDuration}>
                <View style={styles.flightLine} />
                <Ionicons name="airplane" size={20} color="#718096" />
                <View style={styles.flightLine} />
                <Text style={styles.durationText}>{flight.duration}</Text>
              </View>
              <View style={styles.flightLocation}>
                <Text style={styles.flightCity}>{flight.to}</Text>
                <Text style={styles.flightTime}>{flight.arrivalTime}</Text>
              </View>
            </View>
            <View style={styles.flightFooter}>
              <Text style={styles.flightAirline}>{flight.airline}</Text>
              <Text style={styles.flightPrice}>${flight.price}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderHotelInfo = () => {
    if (!hotels || !hotels.length) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hotel information available</Text>
        </View>
      );
    }

    return (
      <View style={styles.hotelContainer}>
        {hotels.map((hotel, index) => (
          <View key={index} style={styles.hotelCard}>
            <View style={styles.hotelHeader}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <View style={styles.hotelRating}>
                {Array(Math.floor(hotel.rating || 0)).fill().map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#F6AD55" />
                ))}
              </View>
            </View>
            <Text style={styles.hotelAddress}>{hotel.address}</Text>
            <View style={styles.hotelDetails}>
              <View style={styles.hotelDetail}>
                <Ionicons name="calendar-outline" size={16} color="#718096" />
                <Text style={styles.hotelDetailText}>
                  {formatDate(hotel.checkIn)} - {formatDate(hotel.checkOut)}
                </Text>
              </View>
              <View style={styles.hotelDetail}>
                <Ionicons name="cash-outline" size={16} color="#718096" />
                <Text style={styles.hotelDetailText}>${hotel.price} per night</Text>
              </View>
            </View>
            <Text style={styles.hotelDescription}>{hotel.description}</Text>
            {hotel.amenities && (
              <View style={styles.amenitiesContainer}>
                <Text style={styles.amenitiesTitle}>Amenities:</Text>
                <View style={styles.amenitiesList}>
                  {hotel.amenities.map((amenity, i) => (
                    <View key={i} style={styles.amenityItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#68D391" />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderItinerary = () => {
    if (!itinerary || !itinerary.length) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No itinerary available</Text>
        </View>
      );
    }

    return (
      <View style={styles.itineraryContainer}>
        {itinerary.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>Day {index + 1}</Text>
              <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
            </View>
            <View style={styles.activitiesList}>
              {day.activities.map((activity, i) => (
                <View key={i} style={styles.activityItem}>
                  <View style={styles.activityTime}>
                    <Text style={styles.timeText}>{activity.time}</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    {activity.location && (
                      <View style={styles.activityLocation}>
                        <Ionicons name="location-outline" size={16} color="#718096" />
                        <Text style={styles.locationText}>{activity.location}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <WebDashboardLayout title="Trip Details">
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#4A5568" />
          <Text style={styles.backButtonText}>Back to My Trips</Text>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <View style={styles.headerImageContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4B4B" />
              </View>
            ) : imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.headerImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={60} color="#CBD5E0" />
              </View>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.destination}>{locationInfo.name}</Text>
            <Text style={styles.country}>{locationInfo.country}</Text>
            <View style={styles.tripDetails}>
              <View style={styles.tripDetail}>
                <Ionicons name="calendar-outline" size={20} color="#718096" />
                <Text style={styles.tripDetailText}>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </Text>
              </View>
              <View style={styles.tripDetail}>
                <Ionicons name="people-outline" size={20} color="#718096" />
                <Text style={styles.tripDetailText}>{travelers} Travelers</Text>
              </View>
              <View style={styles.tripDetail}>
                <Ionicons name="cash-outline" size={20} color="#718096" />
                <Text style={styles.tripDetailText}>Budget: ${budget}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabButtonText}>Itinerary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabButtonText}>Flights</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabButtonText}>Hotels</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Flights</Text>
          {renderFlightInfo()}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Accommodation</Text>
          {renderHotelInfo()}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Itinerary</Text>
          {renderItinerary()}
        </View>
      </View>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  headerImageContainer: {
    width: '40%',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
  },
  headerInfo: {
    flex: 1,
    padding: 24,
  },
  destination: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  country: {
    fontSize: 18,
    color: '#718096',
    marginBottom: 20,
  },
  tripDetails: {
    gap: 12,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripDetailText: {
    fontSize: 16,
    color: '#4A5568',
  },
  tabsContainer: {
    marginBottom: 30,
  },
  tabs: {
    flexDirection: 'row',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    marginRight: 12,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  noDataContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  noDataText: {
    fontSize: 16,
    color: '#718096',
  },
  flightContainer: {
    gap: 16,
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flightType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  flightDate: {
    fontSize: 16,
    color: '#718096',
  },
  flightDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flightLocation: {
    alignItems: 'center',
  },
  flightCity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  flightTime: {
    fontSize: 14,
    color: '#718096',
  },
  flightDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  flightLine: {
    height: 1,
    backgroundColor: '#CBD5E0',
    flex: 1,
  },
  durationText: {
    fontSize: 12,
    color: '#718096',
    position: 'absolute',
    bottom: -20,
  },
  flightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 16,
  },
  flightAirline: {
    fontSize: 16,
    color: '#4A5568',
  },
  flightPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4B4B',
  },
  hotelContainer: {
    gap: 16,
  },
  hotelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  hotelRating: {
    flexDirection: 'row',
  },
  hotelAddress: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  hotelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hotelDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotelDetailText: {
    fontSize: 14,
    color: '#4A5568',
  },
  hotelDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  amenitiesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 16,
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 16,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#4A5568',
  },
  itineraryContainer: {
    gap: 16,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  dayDate: {
    fontSize: 16,
    color: '#718096',
  },
  activitiesList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
  },
  activityTime: {
    width: 80,
    paddingRight: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
  },
  activityContent: {
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: '#CBD5E0',
    paddingLeft: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 8,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#718096',
  },
}); 