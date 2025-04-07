import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  // Get safe area insets
  const insets = useSafeAreaInsets();
  
  // Common tab bar style with content positioned higher
  const tabBarStyle = {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: Platform.OS === 'ios' ? 40 + insets.bottom : 50, // Fixed height
    paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0, // Only bottom padding for iOS home indicator
    paddingTop: 0, // No top padding
    // Add shadow for better visual separation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  };

  // Slightly larger icon size
  const iconSize = 24;

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarLabelStyle: {
          fontFamily: 'outfit-medium',
          fontSize: 11,
          marginTop: -5, // Negative margin to move label up
          paddingBottom: 5, // Add padding at bottom instead
        },
        tabBarStyle: tabBarStyle,
        tabBarIconStyle: {
          marginTop: -2, // Negative margin to move icon up
        },
        tabBarItemStyle: {
          paddingTop: 8, // Move content to top of tab bar
          height: Platform.OS === 'ios' ? 50 : 50, // Fixed height for tab bar items
        },
      }}
    >
      <Tabs.Screen 
        name="mytrip"
        options={{
          tabBarLabel: 'My Trips',
          tabBarIcon: ({color}) => (
            <Ionicons name="map-outline" size={iconSize} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="discover"
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({color}) => (
            <Ionicons name="compass-outline" size={iconSize} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => (
            <Ionicons name="person-outline" size={iconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}