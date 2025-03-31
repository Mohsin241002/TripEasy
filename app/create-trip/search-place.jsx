import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { CreateTripContext } from "./../../context/CreateTripContext";

const MAPTILER_API_KEY = "uCBXEjePDis0WAcvUmjc";

export default function SearchPlace() {
  const navigation = useNavigation();
  const { tripData, setTripData } = useContext(CreateTripContext);
  const router = useRouter();
  const [currentSearchType, setCurrentSearchType] = useState("starting"); // "starting" or "destination"
  const [startingSearchQuery, setStartingSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "Search",
    });
  }, []);

  useEffect(() => {
    console.log(tripData);
  }, [tripData]);

  const searchPlaces = async (query) => {
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}`
        );
        const text = await response.text(); // Get the raw response text
        console.log("Raw API response:", text); // Log the raw response
        
        try {
          const data = JSON.parse(text); // Try to parse the JSON
          setSearchResults(data.features);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.log("Response that caused the error:", text);
        }
      } catch (error) {
        console.error("Error searching places:", error);
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
          coordinates: {
            lat: place.center[1],
            lng: place.center[0],
          },
          // Note: MapTiler doesn't provide photo references or URLs directly
          // You may need to use a different API or service for images
          photoRef: null,
          url: null,
        },
      });
      // Switch to destination search after selecting starting location
      setCurrentSearchType("destination");
      setStartingSearchQuery(place.place_name);
      setSearchResults([]);
    } else {
      setTripData({
        ...tripData,
        locationInfo: {
          name: place.place_name,
          coordinates: {
            lat: place.center[1],
            lng: place.center[0],
          },
          // Note: MapTiler doesn't provide photo references or URLs directly
          // You may need to use a different API or service for images
          photoRef: null,
          url: null,
        },
      });
      router.push('/create-trip/select-traveler');
    }
  };

  const switchToDestinationSearch = () => {
    if (!tripData.startingLocationInfo) {
      alert("Please select a starting location first");
      return;
    }
    setCurrentSearchType("destination");
    setSearchResults([]);
  };

  return (
    <View
      style={{
        padding: 25,
        paddingTop: 75,
        backgroundColor: "#fff",
        height: "100%",
      }}
    >
      {currentSearchType === "starting" ? (
        <>
          <Text style={{
            fontFamily: 'outfit-bold',
            fontSize: 24,
            marginBottom: 10,
          }}>Where are you starting from?</Text>
          <TextInput
            placeholder="Search Starting Location"
            value={startingSearchQuery}
            onChangeText={(text) => {
              setStartingSearchQuery(text);
              searchPlaces(text);
            }}
            style={{
              borderWidth: 1,
              borderRadius: 5,
              marginTop: 10,
              padding: 10,
            }}
          />
        </>
      ) : (
        <>
          <Text style={{
            fontFamily: 'outfit-bold',
            fontSize: 24,
            marginBottom: 10,
          }}>Where do you want to go?</Text>
          <Text style={{
            fontFamily: 'outfit',
            fontSize: 16,
            marginBottom: 10,
          }}>Starting from: {tripData.startingLocationInfo?.name}</Text>
          <TextInput
            placeholder="Search Destination"
            value={destinationSearchQuery}
            onChangeText={(text) => {
              setDestinationSearchQuery(text);
              searchPlaces(text);
            }}
            style={{
              borderWidth: 1,
              borderRadius: 5,
              marginTop: 10,
              padding: 10,
            }}
          />
        </>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePlaceSelect(item)}
            style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
          >
            <Text>{item.place_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}