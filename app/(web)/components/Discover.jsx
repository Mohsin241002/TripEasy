import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TextInput, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import WebDashboardLayout from './WebDashboardLayout';

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

const fetchPOIFromMapTiler = async (bbox, countryName) => {
  const apiKey = 'uCBXEjePDis0WAcvUmjc';
  try {
    const response = await axios.get('https://api.maptiler.com/geocoding/poi.json', {
      params: {
        key: apiKey,
        bbox: bbox,
        limit: 1,
      },
    });
    const feature = response.data.features[0];
    if (feature) {
      return {
        name: feature.properties.name,
        brief: feature.properties.description || 'A popular place to visit.',
        location: `${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`,
        country: countryName,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching POI from MapTiler:", error);
    return null;
  }
};

export default function WebDiscover() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [trendingPlaces, setTrendingPlaces] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadTrendingPlaces();
  }, []);

  const loadTrendingPlaces = async () => {
    setLoading(true);
    try {
      // Sample trending places data
      const places = [
        { name: 'Paris', country: 'France', brief: 'The City of Light with iconic landmarks like the Eiffel Tower and Louvre Museum.' },
        { name: 'Tokyo', country: 'Japan', brief: 'A bustling metropolis blending ultramodern and traditional aspects of Japanese culture.' },
        { name: 'New York', country: 'USA', brief: 'The Big Apple featuring skyscrapers, Central Park, and vibrant cultural scenes.' },
        { name: 'Rome', country: 'Italy', brief: 'The Eternal City with ancient ruins, Vatican City, and delicious Italian cuisine.' },
        { name: 'Bali', country: 'Indonesia', brief: 'A tropical paradise with beautiful beaches, lush rice terraces, and spiritual temples.' },
        { name: 'Barcelona', country: 'Spain', brief: 'Known for stunning architecture, Mediterranean beaches, and vibrant street life.' }
      ];

      // Fetch images for each place
      const placesWithImages = await Promise.all(
        places.map(async (place) => {
          const imageUrl = await fetchImage(`${place.name} ${place.country} travel`);
          return { ...place, imageUrl };
        })
      );

      setTrendingPlaces(placesWithImages);
    } catch (error) {
      console.error('Error loading trending places:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPlaces = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=uCBXEjePDis0WAcvUmjc`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const results = await Promise.all(
          data.features.slice(0, 5).map(async (feature) => {
            const placeName = feature.place_name || feature.text;
            const country = feature.context?.find(c => c.id.startsWith('country'))?.text || '';
            const imageUrl = await fetchImage(`${placeName} ${country} travel`);
            
            return {
              id: feature.id,
              name: placeName,
              country: country,
              brief: `Discover the beauty and culture of ${placeName}.`,
              imageUrl,
              coordinates: feature.center,
            };
          })
        );
        
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlacePress = (place) => {
    // Navigate to location details page
    router.push({
      pathname: '../(web)/location-details',
      params: { 
        locationName: place.name, 
        country: place.country,
        imageUrl: place.imageUrl
      }
    });
  };

  const renderPlaceCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.placeCard}
      onPress={() => handlePlacePress(item)}
    >
      <View style={styles.placeImageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.placeImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#CBD5E0" />
          </View>
        )}
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeCountry}>{item.country}</Text>
        <Text style={styles.placeBrief} numberOfLines={2}>{item.brief}</Text>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => handlePlacePress(item)}
        >
          <Text style={styles.exploreButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <WebDashboardLayout title="Discover">
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a destination..."
              placeholderTextColor="#A0AEC0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchPlaces}
            />
          </View>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={searchPlaces}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? 'Searching...' : 'Search'}
            </Text>
          </TouchableOpacity>
        </View>

        {searchQuery.trim().length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {isSearching ? (
              <ActivityIndicator size="large" color="#FF4B4B" style={styles.loader} />
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderPlaceCard}
                keyExtractor={(item) => item.id}
                horizontal={false}
                numColumns={Platform.OS === 'web' ? 2 : 1}
                columnWrapperStyle={Platform.OS === 'web' ? styles.placeGrid : null}
                contentContainerStyle={styles.resultsList}
              />
            ) : (
              <Text style={styles.noResultsText}>No results found. Try a different search term.</Text>
            )}
          </View>
        )}

        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>Trending Destinations</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FF4B4B" style={styles.loader} />
          ) : (
            <FlatList
              data={trendingPlaces}
              renderItem={renderPlaceCard}
              keyExtractor={(item, index) => `trending-${index}`}
              horizontal={false}
              numColumns={Platform.OS === 'web' ? 2 : 1}
              columnWrapperStyle={Platform.OS === 'web' ? styles.placeGrid : null}
              contentContainerStyle={styles.placesList}
            />
          )}
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3748',
  },
  searchButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsSection: {
    marginBottom: 30,
  },
  trendingSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginVertical: 30,
  },
  placesList: {
    paddingBottom: 20,
  },
  resultsList: {
    paddingBottom: 20,
  },
  placeGrid: {
    justifyContent: 'space-between',
  },
  placeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    width: Platform.OS === 'web' ? 'calc(50% - 10px)' : '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      },
    } : {}),
  },
  placeImageContainer: {
    height: 200,
    backgroundColor: '#F7FAFC',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
  },
  placeInfo: {
    padding: 20,
  },
  placeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  placeCountry: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 12,
  },
  placeBrief: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
  },
}); 