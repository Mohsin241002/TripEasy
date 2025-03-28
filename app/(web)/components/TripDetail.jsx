import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Platform, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';
import WebDashboardLayout from './WebDashboardLayout';

// Single simplified image proxy function for web - needed for CORS
const getProxiedImageUrl = (url) => {
  if (!url || Platform.OS !== 'web') return url;
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
};

// Single simple image fetching function - Pexels only
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
    return null;
  }
};

export default function WebTripDetail({ trip }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [placeImages, setPlaceImages] = useState({});
  const [imageLoadAttempted, setImageLoadAttempted] = useState({}); // Track if we've tried loading an image
  const mountedRef = useRef(true);
  
  // Parse trip data
  const tripData = typeof trip.tripData === 'string' ? JSON.parse(trip.tripData) : trip.tripData;
  
  // Handle AI generated trip plan data
  const tripPlan = trip.tripPlan || null;
  
  // Extract basic trip info and format traveler/budget to handle both string and object formats
  const { locationInfo, startDate, endDate } = tripData;
  
  // Handle traveler which can be either a string or an object
  const traveler = tripData.traveler;
  const travelerDisplay = typeof traveler === 'object' && traveler !== null 
    ? `${traveler.title} - ${traveler.desc}` 
    : traveler;
  
  // Handle budget which can be either a string or an object
  const budget = tripData.budget;
  const budgetDisplay = typeof budget === 'object' && budget !== null
    ? budget.title
    : budget;
  
  // Make sure we don't update state after unmounting
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load header image - one simple call
  useEffect(() => {
    const loadHeaderImage = async () => {
      setLoading(true);
      try {
        // First check if location has a photo URL in tripData
        if (locationInfo.photoUrl) {
          setImageUrl(Platform.OS === 'web' ? getProxiedImageUrl(locationInfo.photoUrl) : locationInfo.photoUrl);
        } else {
          // If not, try once with Pexels
          const url = await fetchImage(`${locationInfo.name} ${locationInfo.country}`);
          if (url) {
            setImageUrl(Platform.OS === 'web' ? getProxiedImageUrl(url) : url);
          }
        }
      } catch (error) {
        // Silent error handling
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadHeaderImage();
  }, [locationInfo]);

  // Very simple place image loading - one attempt only
  const loadPlaceImage = async (placeId, placeName) => {
    if (!mountedRef.current || imageLoadAttempted[placeId]) return;
    
    setImageLoadAttempted(prev => ({ ...prev, [placeId]: true }));
    
    try {
      const imageUrl = await fetchImage(`${placeName} landmark`);
      
      if (imageUrl && mountedRef.current) {
        setPlaceImages(prev => ({
          ...prev,
          [placeId]: Platform.OS === 'web' ? getProxiedImageUrl(imageUrl) : imageUrl
        }));
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const handleBackPress = () => {
    router.push('./mytrips');
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('MMM D, YYYY');
  };
  
  const renderOverview = () => {
    if (!tripPlan) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Trip details are being generated...</Text>
        </View>
      );
    }
    
    const details = tripPlan.trip_details || {};
    
    return (
      <View style={styles.overviewContainer}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Trip Summary</Text>
          <View style={styles.overviewDetail}>
            <Ionicons name="location-outline" size={20} color="#718096" />
            <Text style={styles.overviewText}>Destination: {details.destination || locationInfo.name}</Text>
          </View>
          <View style={styles.overviewDetail}>
            <Ionicons name="calendar-outline" size={20} color="#718096" />
            <Text style={styles.overviewText}>Duration: {details.duration || `${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} Days`}</Text>
          </View>
          <View style={styles.overviewDetail}>
            <Ionicons name="people-outline" size={20} color="#718096" />
            <Text style={styles.overviewText}>Travelers: {details.travelers || travelerDisplay}</Text>
          </View>
          <View style={styles.overviewDetail}>
            <Ionicons name="cash-outline" size={20} color="#718096" />
            <Text style={styles.overviewText}>Budget: {details.budget || budgetDisplay}</Text>
          </View>
          {details.best_time_to_visit && (
            <View style={styles.overviewDetail}>
              <Ionicons name="time-outline" size={20} color="#718096" />
              <Text style={styles.overviewText}>Best time to visit: {details.best_time_to_visit}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFlightInfo = () => {
    if (!tripPlan || !tripPlan.flights || !tripPlan.flights.details || tripPlan.flights.details.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No flight information available</Text>
        </View>
      );
    }

    return (
      <View style={styles.flightContainer}>
        {tripPlan.flights.details.map((flight, index) => (
          <View key={index} style={styles.flightCard}>
            <View style={styles.flightHeader}>
              <Text style={styles.flightAirline}>{flight.airline}</Text>
              <Text style={styles.flightNumber}>{flight.flight_number}</Text>
            </View>
            <View style={styles.flightDetails}>
              <View style={styles.flightLocation}>
                <Text style={styles.flightCity}>{flight.departure_city}</Text>
                <Text style={styles.flightTime}>{flight.departure_time}</Text>
                <Text style={styles.flightDate}>{moment(flight.departure_date).format('MMM D, YYYY')}</Text>
              </View>
              <View style={styles.flightDuration}>
                <View style={styles.flightLine} />
                <Ionicons name="airplane" size={20} color="#718096" />
                <View style={styles.flightLine} />
              </View>
              <View style={styles.flightLocation}>
                <Text style={styles.flightCity}>{flight.arrival_city}</Text>
                <Text style={styles.flightTime}>{flight.arrival_time}</Text>
                <Text style={styles.flightDate}>{moment(flight.arrival_date).format('MMM D, YYYY')}</Text>
              </View>
            </View>
            <View style={styles.flightFooter}>
              <Text style={styles.flightPrice}>{flight.price}</Text>
              {flight.booking_url && (
                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => Platform.OS === 'web' && window.open(flight.booking_url, '_blank')}
                >
                  <Text style={styles.bookButtonText}>Book Flight</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderHotelInfo = () => {
    if (!tripPlan || !tripPlan.hotels || !tripPlan.hotels.options || tripPlan.hotels.options.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hotel information available</Text>
        </View>
      );
    }

    return (
      <View style={styles.hotelContainer}>
        {tripPlan.hotels.options.map((hotel, index) => (
          <View key={index} style={styles.hotelCard}>
            <View style={styles.hotelImageContainer}>
              {hotel.hotel_image_url ? (
                <Image 
                  source={{ uri: hotel.hotel_image_url }} 
                  style={styles.hotelImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.hotelImagePlaceholder}>
                  <Ionicons name="bed-outline" size={40} color="#CBD5E0" />
                </View>
              )}
            </View>
            <View style={styles.hotelContent}>
              <View style={styles.hotelHeader}>
                <Text style={styles.hotelName}>{hotel.hotel_name}</Text>
                <View style={styles.hotelRating}>
                  {Array(Math.floor(hotel.rating || 0)).fill().map((_, i) => (
                    <Ionicons key={i} name="star" size={16} color="#F6AD55" />
                  ))}
                </View>
              </View>
              <Text style={styles.hotelAddress}>{hotel.hotel_address}</Text>
              <View style={styles.hotelDetails}>
                <View style={styles.hotelDetail}>
                  <Ionicons name="cash-outline" size={16} color="#718096" />
                  <Text style={styles.hotelDetailText}>{hotel.price}</Text>
                </View>
                {hotel.geo_coordinates && (
                  <View style={styles.hotelDetail}>
                    <Ionicons name="location-outline" size={16} color="#718096" />
                    <Text style={styles.hotelDetailText}>{hotel.geo_coordinates}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.hotelDescription}>{hotel.description}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderItinerary = () => {
    if (!tripPlan || !tripPlan.itinerary) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No itinerary available</Text>
        </View>
      );
    }

    // Convert the itinerary object to an array
    const itineraryArray = Object.entries(tripPlan.itinerary)
      .map(([key, value]) => ({
        day: key.replace('day', ''), // Extract day number
        dayNum: parseInt(key.replace('day', ''), 10), // Convert to number for sorting
        ...value
      }))
      // Sort the array by day number
      .sort((a, b) => a.dayNum - b.dayNum);

    return (
      <View style={styles.itineraryContainer}>
        {itineraryArray.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>Day {day.day}</Text>
              <Text style={styles.dayTime}>{day.time}</Text>
            </View>
            <Text style={styles.dayActivity}>{day.activity}</Text>
            
            {day.places_to_visit && day.places_to_visit.length > 0 && (
              <View style={styles.placesContainer}>
                <Text style={styles.placesTitle}>Places to Visit:</Text>
                {day.places_to_visit.map((place, i) => {
                  // Create a unique ID for this place
                  const placeId = `day${day.day}-place${i}`;
                  
                  // Super simple image source handling
                  let imageSource = null;
                  
                  if (place.place_image_url) {
                    // Use existing image (with proxy for web)
                    imageSource = { uri: Platform.OS === 'web' 
                      ? getProxiedImageUrl(place.place_image_url) 
                      : place.place_image_url 
                    };
                  } else if (placeImages[placeId]) {
                    // Use fetched image
                    imageSource = { uri: placeImages[placeId] };
                  } else if (!imageLoadAttempted[placeId]) {
                    // Try to load image once
                    loadPlaceImage(placeId, place.place_name);
                  }

                  return (
                    <View key={i} style={styles.placeCard}>
                      <View style={styles.placeImageContainer}>
                        {imageSource ? (
                          <Image 
                            source={imageSource}
                            style={styles.placeImage} 
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.placeImagePlaceholder}>
                            <Ionicons name="image-outline" size={40} color="#CBD5E0" />
                          </View>
                        )}
                      </View>
                      <View style={styles.placeContent}>
                        <Text style={styles.placeName}>{place.place_name}</Text>
                        <Text style={styles.placeDetails}>{place.place_details}</Text>
                        
                        <View style={styles.placeInfo}>
                          {place.geo_coordinates && (
                            <View style={styles.placeInfoItem}>
                              <Ionicons name="location-outline" size={14} color="#718096" />
                              <Text style={styles.placeInfoText}>{place.geo_coordinates}</Text>
                            </View>
                          )}
                          {place.ticket_pricing && (
                            <View style={styles.placeInfoItem}>
                              <Ionicons name="ticket-outline" size={14} color="#718096" />
                              <Text style={styles.placeInfoText}>Ticket: {place.ticket_pricing}</Text>
                            </View>
                          )}
                          {place.time_to_travel && (
                            <View style={styles.placeInfoItem}>
                              <Ionicons name="time-outline" size={14} color="#718096" />
                              <Text style={styles.placeInfoText}>Time needed: {place.time_to_travel}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const TabButton = ({ title, icon, tabId, active }) => (
    <TouchableOpacity 
      style={[styles.tabButton, active && styles.activeTabButton]}
      onPress={() => setActiveTab(tabId)}
    >
      <Ionicons name={icon} size={20} color={active ? "#FF4B4B" : "#718096"} />
      <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <WebDashboardLayout title="Trip Details">
      <ScrollView style={styles.container}>
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
                <Text style={styles.tripDetailText}>{travelerDisplay}</Text>
              </View>
              <View style={styles.tripDetail}>
                <Ionicons name="cash-outline" size={20} color="#718096" />
                <Text style={styles.tripDetailText}>Budget: {budgetDisplay}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            <TabButton 
              title="Overview" 
              icon="information-circle-outline" 
              tabId="overview" 
              active={activeTab === 'overview'} 
            />
            <TabButton 
              title="Flights" 
              icon="airplane-outline" 
              tabId="flights" 
              active={activeTab === 'flights'} 
            />
            <TabButton 
              title="Hotels" 
              icon="bed-outline" 
              tabId="hotels" 
              active={activeTab === 'hotels'} 
            />
            <TabButton 
              title="Itinerary" 
              icon="calendar-outline" 
              tabId="itinerary" 
              active={activeTab === 'itinerary'} 
            />
          </ScrollView>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'flights' && renderFlightInfo()}
          {activeTab === 'hotels' && renderHotelInfo()}
          {activeTab === 'itinerary' && renderItinerary()}
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  headerImageContainer: {
    width: '40%',
    height: 220,
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
    width: '60%',
    padding: 20,
  },
  destination: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  country: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 16,
  },
  tripDetails: {
    marginTop: 8,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripDetailText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 8,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTabButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
  },
  tabText: {
    fontSize: 16,
    color: '#718096',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FF4B4B',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  noDataContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  noDataText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  
  // Overview Styles
  overviewContainer: {
    marginBottom: 24,
  },
  overviewCard: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  overviewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 8,
  },
  
  // Flight Styles
  flightContainer: {
    marginBottom: 24,
  },
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  flightAirline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  flightNumber: {
    fontSize: 16,
    color: '#718096',
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  flightLocation: {
    alignItems: 'center',
    width: '40%',
  },
  flightCity: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
    textAlign: 'center',
  },
  flightTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 4,
  },
  flightDate: {
    fontSize: 14,
    color: '#718096',
  },
  flightDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20%',
  },
  flightLine: {
    height: 1,
    backgroundColor: '#CBD5E0',
    width: 40,
  },
  flightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  flightPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  bookButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  // Hotel Styles
  hotelContainer: {
    marginBottom: 24,
  },
  hotelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    flexDirection: 'row',
  },
  hotelImageContainer: {
    width: 120,
    height: 160,
  },
  hotelImage: {
    width: '100%',
    height: '100%',
  },
  hotelImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotelContent: {
    flex: 1,
    padding: 16,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
    marginRight: 8,
  },
  hotelRating: {
    flexDirection: 'row',
  },
  hotelAddress: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
  },
  hotelDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  hotelDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  hotelDetailText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 4,
  },
  hotelDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  
  // Itinerary Styles
  itineraryContainer: {
    marginBottom: 24,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  dayTime: {
    fontSize: 14,
    color: '#718096',
  },
  dayActivity: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 16,
    lineHeight: 24,
  },
  placesContainer: {
    marginTop: 8,
  },
  placesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  placeCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  placeImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#ddd',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  placeContent: {
    padding: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  placeDetails: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 8,
    lineHeight: 20,
  },
  placeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  placeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  placeInfoText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 4,
  },
  placeImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
  },
  noImageText: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
  },
}); 