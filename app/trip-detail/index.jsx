import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import axios from 'axios';
import moment from 'moment/moment';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { db } from '../../configs/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import FlightInfo from '../../components/TripDetails/FlightInfo';
import HotelList from '../../components/TripDetails/HotelList';
import PlanTrip from '../../components/TripDetails/PlanTrip';

const fetchImage = async (locationName) => {
  const apiKey = 'imY45DES967sZGy0D3e3wz8XAx6iNXvIzdbzmzDSlQPr5OmZlhNtMedH'; // Pexels API key
  try {
    console.log("Fetching image for location:", locationName);
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        'Authorization': apiKey
      },
      params: {
        query: locationName,
        per_page: 1
      },
    });
    const imageUrl = response.data.photos[0]?.src.large;
    console.log("Fetched image URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error fetching image from Pexels:", error);
    throw error;
  }
};

export default function TripDetails() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [tripDetails, setTripDetails] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('flights');
  const hasFetched = useRef(false);

  // Debugging function to safely log nested objects
  const debugTripData = (data) => {
    try {
      console.log("Trip details structure:", 
        JSON.stringify({
          hasData: !!data,
          hasTripPlan: !!data?.tripPlan,
          hasTripData: !!data?.tripData,
          tripPlanKeys: data?.tripPlan ? Object.keys(data.tripPlan) : [],
          tripDataKeys: data?.tripData ? (typeof data.tripData === 'string' ? 'string-needs-parsing' : Object.keys(data.tripData)) : []
        }, null, 2)
      );
    } catch (e) {
      console.log("Error logging trip data:", e);
    }
  };

  // Helper function to safely parse JSON strings
  const safelyParseJSON = (jsonString) => {
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return null;
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: ''
    });

    if (hasFetched.current) return;

    const fetchTripDetails = async () => {
      try {
        // Mark as fetched immediately to prevent multiple fetches
        hasFetched.current = true;
        console.log("Fetching trip details, params:", JSON.stringify(params, null, 2));
        
        let tripData;
        
        // Handle trip ID passed from mobile view
        if (params.id) {
          console.log("Fetching trip by ID:", params.id);
          const tripDoc = await getDoc(doc(db, 'UserTrips', params.id));
          
          if (!tripDoc.exists()) {
            setError("Trip not found");
            setLoading(false);
            return;
          }
          
          tripData = tripDoc.data();
          console.log("Fetched trip data from Firestore");
          
          // For mobile view, the tripPlan might be inside tripData or directly on the document
          if (tripData.tripData) {
            const parsedTripData = safelyParseJSON(tripData.tripData);
            
            if (parsedTripData?.tripPlan) {
              // If tripPlan is inside tripData
              tripData.tripPlan = parsedTripData.tripPlan;
              console.log("Found tripPlan inside tripData");
            }
          }
          
          // If tripPlan is directly on the document but as a string
          if (tripData.tripPlan && typeof tripData.tripPlan === 'string') {
            tripData.tripPlan = safelyParseJSON(tripData.tripPlan);
            console.log("Parsed tripPlan from string");
          }
          
          setTripDetails(tripData);
          console.log("Trip plan set with structure:", 
            tripData.tripPlan ? 
            `Has flights: ${!!tripData.tripPlan.flights}, Has hotels: ${!!tripData.tripPlan.hotels}, Has itinerary: ${!!tripData.tripPlan.itinerary}` : 
            "No tripPlan found");
        } 
        // Handle trip object passed from web view
        else if (params.trip) {
          let parsedTrip = safelyParseJSON(params.trip);
          console.log("Using passed trip data");
          
          // Similar parsing logic for web view
          if (parsedTrip.tripData) {
            const parsedTripData = safelyParseJSON(parsedTrip.tripData);
            
            if (parsedTripData?.tripPlan) {
              parsedTrip.tripPlan = parsedTripData.tripPlan;
              console.log("Found tripPlan inside tripData (web)");
            }
          }
          
          if (parsedTrip.tripPlan && typeof parsedTrip.tripPlan === 'string') {
            parsedTrip.tripPlan = safelyParseJSON(parsedTrip.tripPlan);
            console.log("Parsed tripPlan from string (web)");
          }
          
          setTripDetails(parsedTrip);
          tripData = parsedTrip;
        } else {
          setError("Trip details are not provided");
          setLoading(false);
          return;
        }
        
        // Process trip data
        let locationInfo;
        if (tripData.tripData) {
          let parsedTripData;
          if (typeof tripData.tripData === 'string') {
            parsedTripData = JSON.parse(tripData.tripData);
          } else {
            parsedTripData = tripData.tripData;
          }
          locationInfo = parsedTripData?.locationInfo?.name;
        }

        if (locationInfo) {
          try {
            const url = await fetchImage(locationInfo);
            setImageUrl(url);
          } catch (error) {
            console.error('Error fetching image:', error);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching trip details:", error);
        setError("Failed to fetch trip details");
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, []); // Empty dependency array to run only once

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!tripDetails) {
    return (
      <View style={styles.centered}>
        <Text>No trip details available</Text>
      </View>
    );
  }

  let tripData;
  try {
    tripData = typeof tripDetails.tripData === 'string' ? JSON.parse(tripDetails.tripData) : tripDetails.tripData;
  } catch (error) {
    console.error("Error parsing tripData:", error);
    return (
      <View style={styles.centered}>
        <Text>Error loading trip data</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    // Attempt to get tripPlan data, checking multiple possible locations
    let tripPlan = tripDetails?.tripPlan;
    
    // If no tripPlan directly, try to get it from parsed tripData
    if (!tripPlan && tripDetails?.tripData) {
      const parsedTripData = safelyParseJSON(tripDetails.tripData);
      tripPlan = parsedTripData?.tripPlan;
    }
    
    // Extract the necessary data for each tab
    let flightData, hotelData, itineraryData;
    
    if (tripPlan) {
      flightData = tripPlan.flights?.details;
      hotelData = tripPlan.hotels?.options;
      itineraryData = tripPlan.itinerary;
      
      console.log("Tab data availability:", {
        flights: !!flightData,
        hotels: !!hotelData,
        itinerary: !!itineraryData
      });
      
      // Process itinerary data to ensure it's in the correct format
      if (itineraryData) {
        // If itinerary is a string, try to parse it
        if (typeof itineraryData === 'string') {
          try {
            itineraryData = JSON.parse(itineraryData);
          } catch (e) {
            console.error("Failed to parse itinerary string:", e);
          }
        }
        
        // Check if itinerary has the expected structure (days with activities)
        const hasDays = Object.keys(itineraryData || {}).some(key => key.includes('day'));
        
        // If no day structure, try to unwrap or create the expected structure
        if (!hasDays) {
          // Case 1: Nested itinerary object
          if (itineraryData?.itinerary) {
            itineraryData = itineraryData.itinerary;
          }
          // Case 2: Array of activities that needs to be converted to day structure
          else if (Array.isArray(itineraryData)) {
            const formattedItinerary = {};
            itineraryData.forEach((activity, index) => {
              formattedItinerary[`day${index + 1}`] = {
                activity: activity.description || activity,
                time: activity.time || 'All day'
              };
            });
            itineraryData = formattedItinerary;
          }
          // Case 3: Single activity object that needs to be converted
          else if (typeof itineraryData === 'object') {
            // Try to convert to expected format
            const formattedItinerary = {
              day1: {
                activity: itineraryData.description || 'Explore the destination',
                time: itineraryData.time || 'All day'
              }
            };
            itineraryData = formattedItinerary;
          }
        }
      }
    }
    
    switch (activeTab) {
      case 'flights':
        return (
          <View style={styles.tabContent}>
            {flightData ? (
              <FlightInfo flightData={flightData} />
            ) : (
              <Text style={styles.noDataText}>No flight information available</Text>
            )}
          </View>
        );
      case 'hotels':
        return (
          <View style={styles.tabContent}>
            {hotelData ? (
              <HotelList hotelList={hotelData} />
            ) : (
              <Text style={styles.noDataText}>No hotel information available</Text>
            )}
          </View>
        );
      case 'itinerary':
        return (
          <View style={styles.tabContent}>
            {itineraryData ? (
              <PlanTrip details={itineraryData} />
            ) : (
              <Text style={styles.noDataText}>No itinerary information available</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image 
            source={imageUrl ? { uri: imageUrl } : require('../../assets/images/pl.jpg')} 
            style={styles.coverImage} 
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.destination}>
            {tripDetails.tripPlan?.trip_details?.destination}
          </Text>
          
          <View style={styles.tripInfoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.infoText}>
                {moment(tripData.startDate).format("MMM Do")} - {moment(tripData.endDate).format("MMM Do, YYYY")}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color="#555" />
              <Text style={styles.infoText}>
                {tripData.traveler.title}
              </Text>
            </View>
          </View>
          
          <Text style={styles.travelerDesc}>{tripData.traveler.desc}</Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'flights' && styles.activeTab]} 
            onPress={() => setActiveTab('flights')}
          >
            <Ionicons name="airplane-outline" size={20} color={activeTab === 'flights' ? "#007AFF" : "#555"} />
            <Text style={[styles.tabText, activeTab === 'flights' && styles.activeTabText]}>Flights</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'hotels' && styles.activeTab]} 
            onPress={() => setActiveTab('hotels')}
          >
            <Ionicons name="bed-outline" size={20} color={activeTab === 'hotels' ? "#007AFF" : "#555"} />
            <Text style={[styles.tabText, activeTab === 'hotels' && styles.activeTabText]}>Hotels</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'itinerary' && styles.activeTab]} 
            onPress={() => setActiveTab('itinerary')}
          >
            <MaterialIcons name="explore" size={20} color={activeTab === 'itinerary' ? "#007AFF" : "#555"} />
            <Text style={[styles.tabText, activeTab === 'itinerary' && styles.activeTabText]}>Itinerary</Text>
          </TouchableOpacity>
        </View>
        
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  destination: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  tripInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 6,
    color: '#555',
    fontSize: 15,
  },
  travelerDesc: {
    color: '#777',
    fontSize: 14,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});