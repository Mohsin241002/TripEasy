import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import LocationDetails from './components/LocationDetails';
import { getLocationDetails } from '../../configs/locationDetailsAI';

export default function LocationDetailsPage() {
  const auth = getAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { locationName, country, imageUrl } = params;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [locationDetails, setLocationDetails] = useState(null);
  const [error, setError] = useState(null);
  
  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch location details
  const fetchLocationData = async () => {
    if (!locationName) {
      setError("Location name is required");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const details = await getLocationDetails(locationName, country);
      setLocationDetails(details);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch location details:', error);
      setError(error.message || "Failed to fetch location details. Please try again later.");
      setLocationDetails(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch when user is authenticated and locationName is provided
  useEffect(() => {
    if (!authLoading && user && locationName) {
      fetchLocationData();
    }
  }, [authLoading, user, locationName]);
  
  // Handle redirection if no user
  if (!authLoading && !user) {
    return <Redirect href="/login" />;
  }
  
  // Handle redirection if no location name
  if (!authLoading && !locationName) {
    return <Redirect href="/discover" />;
  }
  
  // Prepare location object for LocationDetails component
  const location = {
    name: locationName,
    country: country || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526495124232-a04e1849168c',
  };
  
  // Return loading state while authentication is being checked
  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }
  
  // Return the LocationDetails component
  return (
    <LocationDetails
      route={{
        params: {
          location,
          details: locationDetails,
          loading,
          error,
        },
      }}
      onBack={() => router.back()}
      onRefresh={fetchLocationData}
      navigation={router}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A5568',
  },
}); 