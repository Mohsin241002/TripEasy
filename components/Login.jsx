import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FF5A5F', '#FF7676', '#FF9A8B']}
        style={styles.backgroundGradient}
      />
      
      {/* Decorative Elements */}
      <View style={styles.circleDecoration1} />
      <View style={styles.circleDecoration2} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Trip<Text style={styles.logoAccent}>Easy</Text></Text>
      </View>
      
      {/* Content Card */}
      <View style={styles.card}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800' }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
          <View style={styles.imageTextContainer}>
            <Text style={styles.imageTitle}>Explore the World</Text>
          </View>
        </View>
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Smart Travel Planning Made Simple</Text>
          
          <Text style={styles.description}>
            Plan your perfect trip with our AI-powered travel assistant. Create personalized itineraries, discover hidden gems, and manage your entire journey in one place.
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('auth/sign-in')}
          >
            <Ionicons name="mail-outline" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Sign In with Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('auth/sign-up')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  circleDecoration1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  circleDecoration2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -100,
    left: -100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontFamily: 'outfit-bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoAccent: {
    color: '#FFFFFF',
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  imageTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  imageTitle: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  contentContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'outfit-bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  description: {
    fontFamily: 'outfit',
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5568',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#FF5A5F",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: 'row',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 16,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FF5A5F',
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
});
