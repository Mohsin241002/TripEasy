import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getLocationDetails } from '../configs/locationDetailsAI';

export default function LocationDetails() {
  const params = useLocalSearchParams();
  const { locationName, country, imageUrl } = params;
  const router = useRouter();
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationDetails, setLocationDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check authentication status
  useEffect(() => {
    console.log("Checking authentication status");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      // Allow guest access instead of forcing login
      // if (!currentUser) {
      //   router.replace('/login');
      // }
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch location details
  const fetchLocationData = async () => {
    if (!locationName) {
      console.log("No location name provided");
      setError("Location name is required");
      setLoading(false);
      return;
    }
    
    console.log(`Fetching details for: ${locationName}, ${country}`);
    setLoading(true);
    setError(null);
    setLocationDetails(null); // Clear any existing data
    
    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("API request timed out after 60 seconds")), 60000)
    );
    
    try {
      console.log("Calling Gemini API for location details...");
      const details = await Promise.race([
        getLocationDetails(locationName, country),
        timeoutPromise
      ]);
      
      if (!details) {
        throw new Error("No data received from API");
      }
      
      console.log("Success! Received AI-generated location details");
      setLocationDetails(details);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch location details:', error);
      setError(`Could not generate information about ${locationName}. This may be due to API limits or connectivity issues. Please try again.`);
      setLocationDetails(null); // Don't use fallback data, show error instead
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh action
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchLocationData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    console.log("Location details component mounted", { user, locationName });
    // Always fetch data, even if no user is logged in
    if (locationName) {
      fetchLocationData();
    }
  }, [locationName]);

  // Safely access data with fallback
  const getAccommodation = (type) => {
    try {
      return locationDetails?.cost_estimates?.accommodation?.[type] || 'Not available';
    } catch (e) {
      return 'Not available';
    }
  };

  if (loading || isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.loadingText}>
          {isRefreshing ? 'Refreshing data...' : `Loading information about ${locationName || 'this location'}...`}
        </Text>
        <Text style={styles.loadingSubtext}>
          Our AI is generating detailed travel information.
          This may take up to 30 seconds.
        </Text>
        
        {/* Show a cancel button after 10 seconds */}
        {loading && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (error || !locationDetails) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={70} color="#FF5A5F" />
        <Text style={styles.errorTitle}>AI Content Unavailable</Text>
        <Text style={styles.errorText}>
          {error || `We couldn't generate information about ${locationName}. This may be due to API limits or connectivity issues.`}
        </Text>
        
        <View style={styles.errorButtonsContainer}>
          <TouchableOpacity 
            style={styles.refreshErrorButton} 
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.refreshErrorText}>Retry AI Generation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#FF5A5F" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }} 
      />
      <ScrollView style={styles.container}>
        {/* Header image with gradient overlay */}
        <View style={styles.headerImageContainer}>
          <Image 
            source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1526495124232-a04e1849168c' }} 
            style={styles.headerImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.locationName}>{locationName}</Text>
              <Text style={styles.locationCountry}>{country}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Introduction section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.introText}>{locationDetails.introduction}</Text>
          </View>

          {/* Famous Dishes section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Famous Local Cuisine</Text>
            {Array.isArray(locationDetails.famous_dishes) && locationDetails.famous_dishes.map((dish, index) => (
              <View key={`dish-${index}`} style={styles.listItem}>
                <Text style={styles.itemTitle}>{dish.name}</Text>
                <Text style={styles.itemDescription}>{dish.description}</Text>
              </View>
            ))}
          </View>

          {/* Places to Visit section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Places to Visit</Text>
            {Array.isArray(locationDetails.places_to_visit) && locationDetails.places_to_visit.map((place, index) => (
              <View key={`place-${index}`} style={styles.listItem}>
                <View style={styles.placeHeader}>
                  <Text style={styles.itemTitle}>{place.name}</Text>
                  {place.visit_duration && (
                    <Text style={styles.visitDuration}>{place.visit_duration}</Text>
                  )}
                </View>
                <Text style={styles.itemDescription}>{place.description}</Text>
              </View>
            ))}
          </View>

          {/* Cost Estimates section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cost Estimates (7 Days)</Text>
            
            <Text style={styles.subSectionTitle}>Accommodation</Text>
            <View style={styles.accommodationContainer}>
              <View style={styles.accommodationItem}>
                <Text style={styles.accommodationType}>Budget</Text>
                <Text style={styles.accommodationPrice}>{getAccommodation('budget')}</Text>
              </View>
              <View style={styles.accommodationItem}>
                <Text style={styles.accommodationType}>Mid-range</Text>
                <Text style={styles.accommodationPrice}>{getAccommodation('mid_range')}</Text>
              </View>
              <View style={styles.accommodationItem}>
                <Text style={styles.accommodationType}>Luxury</Text>
                <Text style={styles.accommodationPrice}>{getAccommodation('luxury')}</Text>
              </View>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costItemLabel}>Food (per day)</Text>
              <Text style={styles.costItemValue}>{locationDetails.cost_estimates?.food_per_day || 'Not available'}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costItemLabel}>Local Transportation</Text>
              <Text style={styles.costItemValue}>{locationDetails.cost_estimates?.local_transportation || 'Not available'}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costItemLabel}>Sightseeing & Activities</Text>
              <Text style={styles.costItemValue}>{locationDetails.cost_estimates?.sightseeing_activities || 'Not available'}</Text>
            </View>
            
            <View style={styles.totalCost}>
              <Text style={styles.totalCostLabel}>Total Estimated Cost</Text>
              <Text style={styles.totalCostValue}>{locationDetails.cost_estimates?.total_estimate || 'Not available'}</Text>
            </View>
          </View>

          {/* Plan trip button */}
          <TouchableOpacity 
            style={styles.planTripButton}
            onPress={() => {
              router.push({
                pathname: '/create-trip',
                params: { 
                  destination: locationName, 
                  country: country 
                }
              });
            }}
          >
            <Text style={styles.planTripButtonText}>Plan a Trip to {locationName}</Text>
          </TouchableOpacity>

          {/* Refresh button */}
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={16} color="#6C63FF" />
            <Text style={styles.refreshButtonText}>Refresh Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    maxWidth: 280,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 10,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  errorButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    width: '100%',
    maxWidth: 280,
  },
  backButton: {
    backgroundColor: '#F7FAFC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    color: '#FF5A5F',
    marginLeft: 4,
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
  refreshErrorButton: {
    backgroundColor: '#FF5A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  refreshErrorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerImageContainer: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginBottom: 15,
  },
  locationName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationCountry: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    padding: 15,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5568',
    marginTop: 8,
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5568',
  },
  listItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  visitDuration: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
  },
  accommodationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  accommodationItem: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    width: '31%',
    marginBottom: 10,
  },
  accommodationType: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  accommodationPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  costItemLabel: {
    fontSize: 15,
    color: '#4A5568',
  },
  costItemValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2D3748',
  },
  totalCost: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C5282',
  },
  totalCostValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C5282',
  },
  planTripButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  planTripButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6C63FF',
    marginBottom: 30,
  },
  refreshButtonText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  cancelButton: {
    marginTop: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E0',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#718096',
  },
}); 