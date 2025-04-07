import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { CreateTripContext } from "./../../context/CreateTripContext";
import { Ionicons } from '@expo/vector-icons';

const MAPTILER_API_KEY = "uCBXEjePDis0WAcvUmjc";

export default function SearchPlace() {
  const navigation = useNavigation();
  const { tripData, setTripData } = useContext(CreateTripContext);
  const router = useRouter();
  const [currentSearchType, setCurrentSearchType] = useState("starting"); // "starting" or "destination"
  const [startingSearchQuery, setStartingSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  const searchPlaces = async (query) => {
    if (query.length > 2) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}`
        );
        const text = await response.text();
        
        try {
          const data = JSON.parse(text);
          setSearchResults(data.features);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.log("Response that caused the error:", text);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching places:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handlePlaceSelect = (place) => {
    if (currentSearchType === "starting") {
      setTripData({
        ...tripData,
        startingLocationInfo: {
          name: place.place_name,
          country: place.place_name.split(',').pop().trim(),
          coordinates: {
            lat: place.center[1],
            lng: place.center[0],
          },
          photoRef: null,
          url: null,
        },
      });
      setCurrentSearchType("destination");
      setStartingSearchQuery(place.place_name);
      setSearchResults([]);
    } else {
      setTripData({
        ...tripData,
        locationInfo: {
          name: place.place_name,
          country: place.place_name.split(',').pop().trim(),
          coordinates: {
            lat: place.center[1],
            lng: place.center[0],
          },
          photoRef: null,
          url: null,
        },
      });
      router.push('/create-trip/select-traveler');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <SafeAreaView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
      
      <View style={styles.content}>
        {currentSearchType === "starting" ? (
          <View style={styles.searchSection}>
            <Text style={styles.title}>Where are you starting from?</Text>
            <Text style={styles.subtitle}>Enter your departure location</Text>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#A0AEC0" style={styles.searchIcon} />
              <TextInput
                placeholder="Search cities, airports, countries..."
                placeholderTextColor="#A0AEC0"
                value={startingSearchQuery}
                onChangeText={(text) => {
                  setStartingSearchQuery(text);
                  searchPlaces(text);
                }}
                style={styles.searchInput}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>
          </View>
        ) : (
          <View style={styles.searchSection}>
            <Text style={styles.title}>Where do you want to go?</Text>
            <Text style={styles.subtitle}>Select your destination</Text>
            
            <View style={styles.startingLocationBadge}>
              <Ionicons name="location" size={16} color="#4F46E5" />
              <Text style={styles.startingLocationText}>{tripData.startingLocationInfo?.name}</Text>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#A0AEC0" style={styles.searchIcon} />
              <TextInput
                placeholder="Search destination..."
                placeholderTextColor="#A0AEC0"
                value={destinationSearchQuery}
                onChangeText={(text) => {
                  setDestinationSearchQuery(text);
                  searchPlaces(text);
                }}
                style={styles.searchInput}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Searching locations...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handlePlaceSelect(item)}
                style={styles.resultItem}
              >
                <Ionicons name="location-outline" size={20} color="#4F46E5" style={styles.resultIcon} />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultName}>{item.place_name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : startingSearchQuery.length > 2 || destinationSearchQuery.length > 2 ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={50} color="#E2E8F0" />
            <Text style={styles.noResultsText}>No locations found</Text>
            <Text style={styles.noResultsSubtext}>Try another search term</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF5A5F',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 28,
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#718096',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#2D3748',
  },
  startingLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  startingLocationText: {
    fontFamily: 'outfit-medium',
    fontSize: 14,
    color: '#4F46E5',
    marginLeft: 6,
  },
  resultsList: {
    flex: 1,
    marginTop: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: '#2D3748',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#718096',
    marginTop: 12,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontFamily: 'outfit-medium',
    fontSize: 18,
    color: '#4A5568',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#718096',
  },
  searchButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 20,
  },
  placeItemButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 'auto',
  },
});