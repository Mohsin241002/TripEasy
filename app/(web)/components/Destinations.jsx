import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Destinations({ destinations, loading }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Destinations</Text>
        <Text style={styles.subtitle}>
          Explore our handpicked selection of stunning locations around the world
        </Text>
      </View>

      <View style={styles.grid}>
        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" />
        ) : (
          destinations.map((destination, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri: destination }}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.overlay}
              >
                <View style={styles.content}>
                  <View style={styles.tags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Adventure</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Nature</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/auth')}
                  >
                    <Text style={styles.buttonText}>Explore Now</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => router.push('/(tabs)/discover')}
      >
        <Text style={styles.viewAllText}>View All Destinations</Text>
        <Ionicons name="arrow-forward" size={20} color="#6C63FF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 100,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    marginBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    lineHeight: 30,
  },
  grid: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 30,
    justifyContent: 'center',
    marginBottom: 60,
    ...(Platform.OS === 'web' ? {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    } : {}),
  },
  card: {
    width: Platform.OS === 'web' ? 'auto' : 380,
    height: 480,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? {
      objectFit: 'cover',
    } : {}),
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 30,
    justifyContent: 'flex-end',
  },
  content: {
    gap: 20,
  },
  tags: {
    flexDirection: 'row',
    gap: 10,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    } : {}),
  },
  buttonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    }),
  },
  viewAllText: {
    color: '#6C63FF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 