import { useFonts } from 'expo-font';
import { Stack, Redirect } from 'expo-router';
import {CreateTripContext} from '../context/CreateTripContext'
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import ResponsiveLayout from '../components/ResponsiveLayout';

// Function to load web-specific CSS
const loadWebStyles = () => {
  if (Platform.OS === 'web') {
    try {
      // Dynamically create and append a link element
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = '/assets/web-styles.css';
      document.head.appendChild(linkElement);
    } catch (error) {
      console.error('Failed to load web styles:', error);
    }
  }
};

export default function RootLayout() {
  useFonts({
    'outfit': require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold': require('./../assets/fonts/Outfit-Bold.ttf'),
  });

  const [tripData, setTripData] = useState([]);

  useEffect(() => {
    // Load web styles when the component mounts
    loadWebStyles();
  }, []);

  return (
    <CreateTripContext.Provider value={{tripData, setTripData}}>
      <ResponsiveLayout>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="auth/sign-in" />
          <Stack.Screen name="auth/sign-up" />
          <Stack.Screen name="create-trip" />
          <Stack.Screen name="trip-detail" />
          <Stack.Screen name="mytrip" />
        </Stack>
      </ResponsiveLayout>
    </CreateTripContext.Provider>
  );
}
