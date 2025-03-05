import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';

// Load web-specific CSS when on web platform
const loadWebStyles = () => {
  if (Platform.OS === 'web') {
    // Add any web-specific global styles here
    const style = document.createElement('style');
    style.textContent = `
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #F7FAFC;
      }
      * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }
};

export default function WebLayout() {
  useEffect(() => {
    loadWebStyles();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="mytrips" />
      <Stack.Screen name="create-trip" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="trip-detail" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="auth" />
    </Stack>
  );
} 