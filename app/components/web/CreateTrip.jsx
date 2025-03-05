import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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

const fetchPOIFromMapTiler = async (query) => {
  const apiKey = 'Ot5YzMVYsQxCnGGwAkGX'; // MapTiler API key
  try {
    const response = await axios.get(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`,
      {
        params: {
          key: apiKey,
        },
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      return {
        name: feature.text,
        description: feature.place_name,
        location: {
          latitude: feature.center[1],
          longitude: feature.center[0],
        },
        country: feature.context?.find(c => c.id.startsWith('country'))?.text || '',
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching POI from MapTiler:", error);
    return null;
  }
};

// Web-compatible date input component
const WebDatePicker = ({ value, onChange, minDate }) => {
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const handleChange = (e) => {
    const newDate = new Date(e.target.value);
    onChange(newDate);
  };

  return Platform.OS === 'web' ? (
    <input
      type="date"
      value={formatDateForInput(value)}
      onChange={handleChange}
      min={minDate ? formatDateForInput(minDate) : undefined}
      style={{
        border: 'none',
        background: 'transparent',
        fontSize: 16,
        color: '#4A5568',
        width: '100%',
        outline: 'none',
        cursor: 'pointer',
      }}
    />
  ) : (
    <Text style={styles.dateText}>{formatDate(value)}</Text>
  );
};

export default function WebCreateTrip() {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [loading, setLoading] = useState(false);
  const [locationImage, setLocationImage] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchPlaces = async () => {
    if (destination.trim().length < 2) return;
    
    setSearchLoading(true);
    try {
      const results = await fetchPOIFromMapTiler(destination);
      if (results) {
        setSearchResults([results]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching places:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);
    setSearchResults([]);
    setDestination(location.name);
    
    try {
      const imageUrl = await fetchImage(`${location.name} ${location.country} travel`);
      setLocationImage(imageUrl);
    } catch (error) {
      console.error("Error fetching location image:", error);
    }
    
    setStep(2);
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    
    // If end date is before start date, update end date
    if (endDate < newDate) {
      setEndDate(new Date(newDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const validateStep1 = () => {
    return selectedLocation !== null;
  };

  const validateStep2 = () => {
    return (
      startDate &&
      endDate &&
      startDate < endDate &&
      budget.trim() !== '' &&
      !isNaN(parseFloat(budget)) &&
      travelers.trim() !== '' &&
      !isNaN(parseInt(travelers))
    );
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleCreateTrip();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateTrip = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to create a trip");
      return;
    }

    setLoading(true);
    try {
      const tripData = {
        locationInfo: selectedLocation,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budget: parseFloat(budget),
        travelers: parseInt(travelers),
        createdAt: new Date().toISOString(),
        userEmail: auth.currentUser.email,
        status: 'planned',
        // Empty placeholders for future data
        itinerary: [],
        hotels: [],
        flights: [],
      };

      const docRef = await addDoc(collection(db, "trips"), {
        tripData: JSON.stringify(tripData),
        userEmail: auth.currentUser.email,
      });

      alert("Trip created successfully!");
      router.push('../web/mytrips');
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Where do you want to go?</Text>
        <Text style={styles.stepDescription}>
          Search for a destination to start planning your trip
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            value={destination}
            onChangeText={setDestination}
            onSubmitEditing={searchPlaces}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchPlaces}>
            {searchLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="search" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => handleLocationSelect(result)}
              >
                <View style={styles.resultContent}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultCountry}>{result.country}</Text>
                  <Text style={styles.resultDescription} numberOfLines={2}>
                    {result.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#A0AEC0" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.length === 0 && destination.trim().length > 0 && !searchLoading && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color="#CBD5E0" />
            <Text style={styles.noResultsText}>No destinations found</Text>
            <Text style={styles.noResultsSubtext}>
              Try a different search term or check the spelling
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStep2 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Trip Details</Text>
        <Text style={styles.stepDescription}>
          Customize your trip to {selectedLocation?.name}
        </Text>

        {locationImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: locationImage }}
              style={styles.locationImage}
              resizeMode="cover"
            />
            <View style={styles.locationOverlay}>
              <Text style={styles.locationName}>{selectedLocation?.name}</Text>
              <Text style={styles.locationCountry}>{selectedLocation?.country}</Text>
            </View>
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>When are you traveling?</Text>
            <View style={styles.dateContainer}>
              <View style={styles.dateInput}>
                <Ionicons name="calendar-outline" size={20} color="#718096" />
                <WebDatePicker 
                  value={startDate} 
                  onChange={handleStartDateChange} 
                  minDate={new Date()} 
                />
              </View>
              <Text style={styles.dateToText}>to</Text>
              <View style={styles.dateInput}>
                <Ionicons name="calendar-outline" size={20} color="#718096" />
                <WebDatePicker 
                  value={endDate} 
                  onChange={handleEndDateChange} 
                  minDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)} 
                />
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>What's your budget? (USD)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your budget"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>How many travelers?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Number of travelers"
              value={travelers}
              onChangeText={setTravelers}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <WebDashboardLayout title="Create Trip">
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.stepsIndicator}>
          <View style={[styles.stepIndicator, step >= 1 && styles.activeStepIndicator]}>
            <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>1</Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepIndicator, step >= 2 && styles.activeStepIndicator]}>
            <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>2</Text>
          </View>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}

        <View style={styles.buttonsContainer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#4A5568" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              (step === 1 && !validateStep1()) || (step === 2 && !validateStep2())
                ? styles.disabledButton
                : {}
            ]}
            onPress={handleNext}
            disabled={(step === 1 && !validateStep1()) || (step === 2 && !validateStep2()) || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {step === 2 ? "Create Trip" : "Next"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepIndicator: {
    backgroundColor: '#FF4B4B',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#718096',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  stepConnector: {
    width: 60,
    height: 2,
    backgroundColor: '#EDF2F7',
    marginHorizontal: 8,
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  resultCountry: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  locationImage: {
    width: '100%',
    height: '100%',
  },
  locationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationCountry: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  formContainer: {
    gap: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  dateText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 8,
  },
  dateToText: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#718096',
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FF4B4B',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  disabledButton: {
    backgroundColor: '#FBD5D5',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
  },
}); 