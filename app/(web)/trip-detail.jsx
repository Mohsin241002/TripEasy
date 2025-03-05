import React, { useEffect, useState } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import WebTripDetail from './components/TripDetail';

export default function TripDetailPage() {
  const auth = getAuth();
  const db = getFirestore();
  const { id } = useLocalSearchParams();
  
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!user || !id) return;

      try {
        const tripDoc = await getDoc(doc(db, "UserTrips", id));
        
        if (tripDoc.exists()) {
          const tripData = tripDoc.data();
          
          // Check if this trip belongs to the current user
          if (tripData.userEmail === user.email) {
            setTrip({
              id: tripDoc.id,
              ...tripData
            });
          } else {
            setError("You don't have permission to view this trip");
          }
        } else {
          setError("Trip not found");
        }
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Failed to load trip details");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrip();
    }
  }, [user, id, db]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4B4B" />
      </View>
    );
  }

  // If user is not logged in, redirect to the landing page
  if (!user) {
    return <Redirect href="../(web)" />;
  }

  // If there was an error loading the trip
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // If trip was loaded successfully
  if (trip) {
    return <WebTripDetail trip={trip} />;
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
  },
}); 