import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function Hero() {
  const router = useRouter();

  return (
    <View style={styles.hero}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>
            Discover Your Next Adventure with AI:
          </Text>
          <Text style={styles.title}>
            Smart Travel Planning Made Simple
          </Text>
          <Text style={styles.description}>
            Plan your perfect trip with our AI-powered travel assistant. Create personalized itineraries, discover hidden gems, and manage your entire journey in one place.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('./signup')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: Platform.OS === 'web' ? 'calc(100vh - 90px)' : '100%',
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  content: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    width: '100%',
    paddingHorizontal: 64,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
  },
  textContainer: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? '50%' : '100%',
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
  },
  subtitle: {
    fontSize: 28,
    color: '#FF4B4B',
    marginBottom: 16,
    fontWeight: '600',
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 36,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 24,
    lineHeight: Platform.OS === 'web' ? 56 : 44,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },
  description: {
    fontSize: 20,
    color: '#4A5568',
    marginBottom: 40,
    lineHeight: 32,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },
  primaryButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        backgroundColor: '#FF3333',
      }
    } : {}),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? '50%' : '100%',
    height: Platform.OS === 'web' ? 500 : 300,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        backgroundColor: '#FF3333',
      }
    } : {}),
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 