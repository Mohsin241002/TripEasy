import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { collection, addDoc, getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import WebDashboardLayout from './WebDashboardLayout';
import { SelectBudgetOptions, SelectTravelersList, AI_PROMPT } from '../../../constants/Options';

// Import Gemini API configuration
import { chatSession } from '../../../configs/AiModal';

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
    console.error("Error fetching image from Pexels:", error);
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

// Option Card Component
const OptionCard = ({option, selectedOption, onSelect}) => {
  const isSelected = selectedOption?.id === option?.id;
  
  return (
    <TouchableOpacity 
      style={[
        styles.optionCard,
        isSelected && styles.selectedOptionCard
      ]}
      onPress={() => onSelect(option)}
    >
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionDesc}>{option.desc}</Text>
      </View>
      <Text style={styles.optionIcon}>{option.icon}</Text>
    </TouchableOpacity>
  );
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
        fontSize: '16px',
        width: '100%',
        color: '#2D3748',
        fontFamily: 'inherit',
      }}
    />
  ) : (
    <Text>{formatDateForInput(value)}</Text>
  );
};

export default function WebCreateTrip() {
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  
  // Step 1: Destination selection
  // Step 2: Date selection
  // Step 3: Traveler selection 
  // Step 4: Budget selection
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationImage, setLocationImage] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [generatingTrip, setGeneratingTrip] = useState(false);

  const MAPTILER_API_KEY = "uCBXEjePDis0WAcvUmjc"; // Using the same API key as the mobile version

  const searchPlaces = async () => {
    if (destination.trim().length < 2) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(destination)}.json?key=${MAPTILER_API_KEY}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
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

  const handleLocationSelect = async (place) => {
    const location = {
      name: place.place_name,
      description: place.place_name,
      location: {
        latitude: place.center[1],
        longitude: place.center[0],
      },
      country: place.context?.find(c => c.id.startsWith('country'))?.text || '',
    };
    
    setSelectedLocation(location);
    setSearchResults([]);
    setDestination(place.place_name);
    
    try {
      const imageUrl = await fetchImage(`${place.place_name} travel`);
      setLocationImage(imageUrl);
    } catch (error) {
      console.error("Error fetching location image:", error);
    }
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

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return selectedLocation !== null;
      case 2:
        return startDate && endDate && startDate < endDate;
      case 3:
        return selectedTraveler !== null;
      case 4:
        return selectedBudget !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleCreateTrip();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStepSelect = (stepNumber) => {
    // Only allow jumping to steps we've already validated
    if (stepNumber < step || validateStep(step)) {
      setStep(stepNumber);
    }
  };

  const generateAIPrompt = (tripData) => {
    const totalDays = Math.ceil((new Date(tripData.endDate) - new Date(tripData.startDate)) / (1000 * 60 * 60 * 24));
    const totalNights = totalDays - 1;
    
    return AI_PROMPT
      .replace('{location}', tripData.locationInfo.name)
      .replace('{totalDays}', totalDays)
      .replace('{totalNight}', totalNights)
      .replace('{totalDays}', totalDays)  // Replace again for the second occurrence
      .replace('{totalNight}', totalNights) // Replace again for the second occurrence
      .replace('{traveler}', tripData.traveler)
      .replace('{budget}', tripData.budget);
  };

  const generateTrip = async (tripData, prompt) => {
    try {
      console.log("Generating trip with prompt:", prompt);
      
      // Call Gemini API to generate trip plan
      const result = await chatSession.sendMessage(prompt);
      const tripPlanText = result.response.text();
      console.log("AI Response:", tripPlanText);
      
      // Parse the JSON from the response
      // The response might contain markdown code blocks, so we need to extract the JSON
      let tripPlan;
      try {
        // Try to parse the entire response as JSON first
        tripPlan = JSON.parse(tripPlanText);
      } catch (e) {
        // If that fails, try to extract JSON from markdown code blocks
        const jsonMatch = tripPlanText.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          tripPlan = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
      
      return tripPlan;
    } catch (error) {
      console.error("Error generating trip:", error);
      throw error;
    }
  };

  const handleCreateTrip = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to create a trip");
      return;
    }

    setLoading(true);
    setGeneratingTrip(true); // Show loading screen

    try {
      // Format the location info to match the mobile version format
      const locationObj = {
        name: selectedLocation.name,
        coordinates: {
          lat: selectedLocation.location.latitude,
          lng: selectedLocation.location.longitude,
        },
        country: selectedLocation.country || '',
        photoUrl: locationImage || null,
      };

      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      const tripData = {
        locationInfo: locationObj,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budget: selectedBudget.title,
        traveler: selectedTraveler.title,
        people: selectedTraveler.people,
        totalNoOfDays: totalDays,
        createdAt: new Date().toISOString(),
        userEmail: auth.currentUser.email,
        status: 'planned',
        // Empty placeholders for future data
        itinerary: [],
        hotels: [],
        flights: [],
      };

      // Generate AI prompt
      const prompt = generateAIPrompt(tripData);
      console.log("AI Prompt:", prompt);

      // Generate trip plan using Gemini API
      const tripPlan = await generateTrip(tripData, prompt);

      // Generate a unique document ID
      const docId = Date.now().toString();

      // Save to the UserTrips collection with the same format as mobile version
      await setDoc(doc(db, "UserTrips", docId), {
        userEmail: auth.currentUser.email,
        tripPlan: tripPlan, // AI result
        tripData: JSON.stringify(tripData), // user selected data
        docId: docId,
        aiPrompt: prompt
      });

      alert("Trip created successfully!");
      router.push('./mytrips');
    } catch (error) {
      console.error("Error creating trip:", error);
      alert("Failed to create trip. Please try again.");
    } finally {
      setLoading(false);
      setGeneratingTrip(false);
    }
  };

  // Step 1: Destination Search
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
            onChangeText={(text) => {
              setDestination(text);
              if (text.length > 2) {
                searchPlaces();
              }
            }}
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
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => item.id || `place-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleLocationSelect(item)}
                >
                  <View style={styles.resultContent}>
                    <Text style={styles.resultName}>{item.place_name}</Text>
                    <Text style={styles.resultDescription} numberOfLines={2}>
                      {item.place_name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#A0AEC0" />
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          </View>
        )}

        {searchResults.length === 0 && destination.trim().length > 0 && !searchLoading && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color="#CBD5E0" />
            <Text style={styles.noResultsText}>No destinations found</Text>
            <Text style={styles.noResultsSubtext}>Try another search term</Text>
          </View>
        )}

        {selectedLocation && (
          <View style={styles.selectedLocationContainer}>
            <Text style={styles.selectedLocationTitle}>Selected Destination</Text>
            <View style={styles.selectedLocationCard}>
              {locationImage ? (
                <Image 
                  source={{ uri: locationImage }} 
                  style={styles.locationImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.locationImagePlaceholder}>
                  <Ionicons name="image-outline" size={48} color="#CBD5E0" />
                </View>
              )}
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{selectedLocation.name}</Text>
                <Text style={styles.locationCountry}>{selectedLocation.country}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Step 2: Dates Selection
  const renderStep2 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>When are you traveling?</Text>
        <Text style={styles.stepDescription}>
          Select your travel dates for {selectedLocation?.name}
        </Text>

        {locationImage && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: locationImage }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.formSection}>
          <View style={styles.dateContainer}>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <View style={styles.dateInput}>
                <Ionicons name="calendar-outline" size={20} color="#718096" />
                <WebDatePicker 
                  value={startDate} 
                  onChange={handleStartDateChange} 
                  minDate={new Date()} 
                />
              </View>
            </View>
            
            <View style={styles.dateInputWrapper}>
              <Text style={styles.dateLabel}>End Date</Text>
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

          <View style={styles.tripDurationContainer}>
            <Text style={styles.tripDuration}>
              {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days, {Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))} nights
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Step 3: Traveler Selection
  const renderStep3 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Who's Travelling?</Text>
        <Text style={styles.stepDescription}>
          Select the type of travelers for your trip
        </Text>

        <View style={styles.formSection}>
          <View style={styles.optionsContainer}>
            {SelectTravelersList.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                selectedOption={selectedTraveler}
                onSelect={setSelectedTraveler}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Step 4: Budget Selection
  const renderStep4 = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>What's your budget?</Text>
        <Text style={styles.stepDescription}>
          Select a budget category for your trip
        </Text>

        <View style={styles.formSection}>
          <View style={styles.optionsContainer}>
            {SelectBudgetOptions.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                selectedOption={selectedBudget}
                onSelect={setSelectedBudget}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  // If we're generating the trip, show a loading screen
  if (generatingTrip) {
    return (
      <WebDashboardLayout title="Generating Trip">
        <View style={styles.generatingContainer}>
          <Text style={styles.generatingTitle}>Please Wait...</Text>
          <Text style={styles.generatingSubtitle}>
            We are working to generate your dream trip
          </Text>
          
          <View style={styles.loadingAnimation}>
            <ActivityIndicator size="large" color="#FF4B4B" />
          </View>
          
          <Text style={styles.generatingNote}>
            Do not go back or refresh the page
          </Text>
        </View>
      </WebDashboardLayout>
    );
  }

  return (
    <WebDashboardLayout title="Create Trip">
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Step Indicators */}
        <View style={styles.stepsIndicator}>
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <TouchableOpacity 
                style={[
                  styles.stepIndicator, 
                  step === stepNumber && styles.activeStepIndicator,
                  step > stepNumber && styles.completedStepIndicator
                ]}
                onPress={() => handleStepSelect(stepNumber)}
              >
                <Text 
                  style={[
                    styles.stepNumber, 
                    (step === stepNumber || step > stepNumber) && styles.activeStepNumber
                  ]}
                >
                  {stepNumber}
                </Text>
              </TouchableOpacity>
              {stepNumber < 4 && <View style={[
                styles.stepConnector,
                step > stepNumber && styles.completedStepConnector
              ]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Current Step Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#4A5568" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.nextButton, 
              !validateStep(step) && styles.disabledButton
            ]} 
            onPress={handleNext}
            disabled={!validateStep(step) || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {step === 4 ? "Create Trip" : "Next"}
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
  completedStepIndicator: {
    backgroundColor: '#48BB78',
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
    width: 40,
    height: 2,
    backgroundColor: '#EDF2F7',
    marginHorizontal: 8,
  },
  completedStepConnector: {
    backgroundColor: '#48BB78',
  },
  stepContainer: {
    padding: 20,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2D3748',
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    maxHeight: 300,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultsList: {
    width: '100%',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
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
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 12,
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  selectedLocationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedLocationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  locationImagePlaceholder: {
    width: 100,
    height: 80,
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  locationCountry: {
    fontSize: 16,
    color: '#718096',
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateToText: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#718096',
  },
  tripDurationContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  tripDuration: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: 'bold',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectedOptionCard: {
    borderColor: '#FF4B4B',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: '#718096',
  },
  optionIcon: {
    fontSize: 30,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A5568',
    fontWeight: 'bold',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4B4B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#FBD5D5',
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  generatingContainer: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
  },
  generatingTitle: {
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
    color: '#2D3748',
  },
  generatingSubtitle: {
    fontFamily: 'sans-serif',
    fontWeight: '500',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#4A5568',
    maxWidth: 300,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  generatingNote: {
    fontFamily: 'sans-serif',
    color: '#808080',
    fontSize: 16,
    textAlign: 'center',
  },
}); 