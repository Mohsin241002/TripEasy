import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Predefined popular travel destinations with complete information
const PREDEFINED_DESTINATIONS = [
  {
    name: "Paris",
    country: "France",
    brief: "The City of Light, known for the Eiffel Tower, art museums, and exquisite cuisine.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000",
    continent: "Europe"
  },
  {
    name: "Tokyo",
    country: "Japan",
    brief: "A vibrant metropolis blending ultramodern and traditional aspects of Japanese culture.",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000",
    continent: "Asia"
  },
  {
    name: "New York",
    country: "United States",
    brief: "The Big Apple, famous for its iconic skyline, Central Park, and diverse neighborhoods.",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000",
    continent: "North America"
  },
  {
    name: "Rome",
    country: "Italy",
    brief: "The Eternal City with ancient ruins, Vatican City, and authentic Italian cuisine.",
    image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000",
    continent: "Europe"
  },
  {
    name: "Sydney",
    country: "Australia",
    brief: "Known for its iconic Opera House, beautiful harbor, and famous beaches.",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1000",
    continent: "Australia"
  },
  {
    name: "Dubai",
    country: "United Arab Emirates",
    brief: "A city of superlatives known for luxurious shopping, ultramodern architecture, and vibrant nightlife.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
    continent: "Asia"
  },
  {
    name: "Barcelona",
    country: "Spain",
    brief: "Known for Gaudí's architectural masterpieces, Mediterranean beaches, and vibrant culture.",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1000",
    continent: "Europe"
  },
  {
    name: "Cairo",
    country: "Egypt",
    brief: "Home to the Pyramids of Giza, ancient history, and the magnificent Nile River.",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000",
    continent: "Africa"
  },
  {
    name: "Rio de Janeiro",
    country: "Brazil",
    brief: "Famous for its Christ the Redeemer statue, Copacabana beach, and annual carnival.",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1000",
    continent: "South America"
  },
  {
    name: "Bali",
    country: "Indonesia",
    brief: "A tropical paradise with beautiful beaches, rice terraces, and vibrant Hindu culture.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000",
    continent: "Asia"
  }
];

const fetchImage = async (locationName) => {
  const apiKey = '44938756-d9d562ffdaf712150c470c59e';
  try {
    const response = await axios.get("https://pixabay.com/api/", {
      params: {
        key: apiKey,
        q: `${locationName} landmark`,
        image_type: 'photo',
        orientation: 'vertical',
        min_width: 500,
        min_height: 800,
        per_page: 3
      },
    });
    
    if (response.data.hits.length > 0) {
      return response.data.hits[0]?.largeImageURL;
    } else {
      console.log("No image found for", locationName);
      return null;
    }
  } catch (error) {
    console.error("Error fetching image from Pixabay:", error);
    return null;
  }
};

const Discover = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load predefined destinations on component mount
    setDestinations(PREDEFINED_DESTINATIONS);
    setLoading(false);
  }, []);

  const searchNewPlace = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Please enter a place name");
      return;
    }
    
    setSearching(true);
    
    try {
      // First, check if the place already exists in our list
      const existingPlace = destinations.find(
        place => place.name.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      
      if (existingPlace) {
        handleCardPress(existingPlace);
        setSearchQuery('');
        setSearching(false);
        return;
      }
      
      // Try to fetch an image for this place
      const imageUrl = await fetchImage(searchQuery);
      
      if (imageUrl) {
        // Create a new place object
        const newPlace = {
          name: searchQuery.trim(),
          country: "Unknown", // We don't have this information
          brief: `Explore ${searchQuery.trim()} with Tripeasy.`,
          image: imageUrl,
          continent: "Unknown"
        };
        
        // Add to destinations list
        setDestinations(prev => [newPlace, ...prev]);
        
        // Navigate to the place details
        handleCardPress(newPlace);
      } else {
        Alert.alert(
          "Place Not Found", 
          "We couldn't find information about this place. Please try a different location.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error searching for place:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setSearchQuery('');
      setSearching(false);
    }
  };

  const handleCardPress = (place) => {
    console.log("Card pressed:", place);
    
    // Ensure all required parameters are present with fallbacks
    const params = {
      locationName: place.name || "Unknown Location",
      country: place.country || place.continent || "Unknown",
      imageUrl: place.image || "https://images.unsplash.com/photo-1526495124232-a04e1849168c"
    };
    
    console.log("Navigating to location details with params:", params);
    
    // Navigate to location-details page at the app root (not in tabs)
    router.push({
      pathname: '/location-details',
      params
    });
  };

  // Filter destinations based on search query
  const filteredDestinations = searchQuery.trim() === '' 
    ? destinations 
    : destinations.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.country.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Discovering amazing places...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find your next adventure</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search a destination..."
          placeholderTextColor="#A0A0A0"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchNewPlace}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={searchNewPlace}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {filteredDestinations.map((place, index) => (
          <TouchableOpacity
            key={`${place.name}-${index}`}
            style={styles.card}
            onPress={() => handleCardPress(place)}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: place.image || 'https://images.unsplash.com/photo-1526495124232-a04e1849168c' }} 
              style={styles.cardImage}
              defaultSource={require('../../assets/images/pl.jpg')}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cardOverlay}
            >
              <Text style={styles.cardName}>{place.name}</Text>
              <Text style={styles.cardBrief} numberOfLines={2}>{place.brief}</Text>
              <View style={styles.cardFooter}>
                <Ionicons name="location" size={16} color="#fff" />
                <Text style={styles.cardLocation}>{place.country || place.continent || 'Unknown'}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
        
        {filteredDestinations.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={80} color="#fff" />
            <Text style={styles.noResultsText}>
              No destinations found. Try a different search term.
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4c669f',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    width: 50,
    height: 50,
    backgroundColor: '#6C63FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    width: '48%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 15,
  },
  cardName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardBrief: {
    color: '#E0E0E0',
    fontSize: 14,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardLocation: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  noResultsContainer: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Discover;
