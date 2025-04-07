import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Linking } from 'react-native';
import moment from 'moment/moment';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

const FlightInfo = ({ flightData }) => {
  if (!flightData || flightData.length === 0) {
    return (
      <View style={styles.noFlightsContainer}>
        <Ionicons name="airplane-outline" size={40} color="#E2E8F0" />
        <Text style={styles.noFlightsText}>No flight details available</Text>
        <Text style={styles.noFlightsSubtext}>Flight information will appear here</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      style={styles.container}
      showsHorizontalScrollIndicator={false}
    >
      {flightData.map((flight, index) => {
        // Skip rendering if flight data is incomplete
        if (!flight || !flight.flight_number) return null;
        
        // Format dates safely
        const departureDate = flight.departure_date ? 
          moment(flight.departure_date).format("MMM D") : 'N/A';
        const arrivalDate = flight.arrival_date ? 
          moment(flight.arrival_date).format("MMM D") : 'N/A';
        
        return (
          <View key={index} style={styles.flightCard}>
            <View style={styles.airlineContainer}>
              <Text style={styles.flightNumber}>{flight.flight_number}</Text>
              <Text style={styles.airline}>{flight.airline || 'Unknown Airline'}</Text>
            </View>
            
            <View style={styles.flightRoute}>
              <View style={styles.locationTime}>
                <Text style={styles.cityCode}>
                  {flight.departure_city ? 
                    flight.departure_city.substring(0, 3).toUpperCase() : '---'}
                </Text>
                <Text style={styles.time}>{flight.departure_time || 'N/A'}</Text>
                <Text style={styles.date}>{departureDate}</Text>
              </View>
              
              <View style={styles.flightPath}>
                <View style={styles.line} />
                <Ionicons name="airplane" size={16} color="#4F46E5" style={styles.planeIcon} />
              </View>
              
              <View style={styles.locationTime}>
                <Text style={styles.cityCode}>
                  {flight.arrival_city ? 
                    flight.arrival_city.substring(0, 3).toUpperCase() : '---'}
                </Text>
                <Text style={styles.time}>{flight.arrival_time || 'N/A'}</Text>
                <Text style={styles.date}>{arrivalDate}</Text>
              </View>
            </View>
            
            <View style={styles.priceSection}>
              <Text style={styles.price}>{flight.price || 'Price not available'}</Text>
            </View>
            
            {flight.booking_url && (
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookFlight(flight.booking_url)}
              >
                <Text style={styles.bookButtonText}>Book Flight</Text>
                <Ionicons name="open-outline" size={16} color="white" style={styles.bookIcon} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const handleBookFlight = (bookingUrl) => {
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
  flightCard: {
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    width: windowWidth * 0.8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  airlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flightNumber: {
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: '#4A5568',
  },
  airline: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#718096',
  },
  flightRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationTime: {
    alignItems: 'center',
  },
  cityCode: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: '#4A5568',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#718096',
  },
  flightPath: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
  },
  line: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  planeIcon: {
    position: 'absolute',
    transform: [{ rotate: '90deg' }]
  },
  priceSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: '#4F46E5',
  },
  bookButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: 'outfit-bold',
    color: '#FFFFFF',
  },
  bookIcon: {
    marginLeft: 4,
  },
  noFlightsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 40,
    marginTop: 12,
  },
  noFlightsText: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: '#4A5568',
    marginTop: 12,
  },
  noFlightsSubtext: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#718096',
    marginTop: 4,
  },
});

export default FlightInfo;
