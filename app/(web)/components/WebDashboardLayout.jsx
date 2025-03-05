import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../../configs/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function WebDashboardLayout({ children, title }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Redirect to home page after sign out
      router.replace("../");
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  // Array of menu items for navigation
  const menuItems = [
    {
      label: 'My Trips',
      icon: 'map-outline',
      active: pathname === '/(web)/mytrips',
      path: '../mytrips',
    },
    {
      label: 'Create Trip',
      icon: 'add-circle-outline',
      active: pathname === '/(web)/create-trip',
      path: '../create-trip',
    },
    {
      label: 'Discover',
      icon: 'compass-outline',
      active: pathname === '/(web)/discover',
      path: '../discover',
    },
    {
      label: 'Profile',
      icon: 'person-outline',
      active: pathname === '/(web)/profile',
      path: '../profile',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Tripeasy</Text>
        </View>
        
        <View style={styles.nav}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.navItem, item.active && styles.activeNavItem]}
              onPress={() => router.push(item.path)}
            >
              <Ionicons 
                name={item.icon} 
                size={20} 
                color={item.active ? '#FF4B4B' : '#4A5568'} 
              />
              <Text style={[
                styles.navText, 
                item.active && styles.activeNavText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.userSection}>
          {user && (
            <>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle-outline" size={24} color="#4A5568" />
                <Text style={styles.userName}>
                  {user.displayName || user.email}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Ionicons name="log-out-outline" size={20} color="#4A5568" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.contentInner}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4B4B',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  activeNavItem: {
    backgroundColor: '#FFF5F5',
  },
  navText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
  },
  activeNavText: {
    color: '#FF4B4B',
    fontWeight: 'bold',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  userName: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A5568',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  signOutText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4A5568',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 40,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 24,
  },
}); 