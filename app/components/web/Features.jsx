import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const features = [
  {
    icon: 'map',
    title: 'Smart Itinerary Planning',
    description: 'AI-powered trip planning that creates personalized itineraries based on your preferences and travel style.'
  },
  {
    icon: 'time',
    title: 'Real-Time Optimization',
    description: 'Dynamic scheduling that adapts to changes in real-time, ensuring your trip stays perfectly organized.'
  },
  {
    icon: 'heart',
    title: 'Personalized Recommendations',
    description: 'Get tailored suggestions for attractions, restaurants, and activities that match your interests.'
  },
  {
    icon: 'wallet',
    title: 'Budget Management',
    description: 'Smart budget tracking and cost optimization to help you make the most of your travel spending.'
  }
];

export default function Features() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Why Choose Us</Text>
          <Text style={styles.title}>Travel Planning Made Simple</Text>
          <Text style={styles.description}>
            Experience the future of travel planning with our AI-powered platform
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Ionicons name={feature.icon} size={32} color="#FF6B6B" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    paddingVertical: 100,
  },
  content: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 80,
  },
  subtitle: {
    fontSize: 18,
    color: '#FF6B6B',
    marginBottom: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 32,
  },
  featuresGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 32,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    width: Platform.OS === 'web' ? 'calc(50% - 16px)' : '100%',
    maxWidth: 500,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
}); 