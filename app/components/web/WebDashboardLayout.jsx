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
      router.replace('../web');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const menuItems = [
    { name: 'My Trips', path: '/mytrip', icon: 'briefcase-outline' },
    { name: 'Create Trip', path: '/create-trip', icon: 'add-circle-outline' },
    { name: 'Discover', path: '/discover', icon: 'compass-outline' },
    { name: 'Profile', path: '/profile', icon: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navbarContent}>
          <TouchableOpacity style={styles.logo} onPress={() => router.push('/')}>
            <Ionicons name="airplane" size={28} color="#FF4B4B" />
            <Text style={styles.logoText}>TripEasy</Text>
          </TouchableOpacity>

          <View style={styles.navLinks}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.path}
                style={[
                  styles.navLink,
                  pathname.includes(item.path) && styles.activeNavLink
                ]}
                onPress={() => router.push(item.path)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={pathname.includes(item.path) ? "#FF4B4B" : "#4A5568"} 
                />
                <Text 
                  style={[
                    styles.navLinkText,
                    pathname.includes(item.path) && styles.activeNavLinkText
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.userSection}>
            {user && (
              <>
                <Text style={styles.userName}>{user.displayName || user.email}</Text>
                <TouchableOpacity 
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                >
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>{title}</Text>
        </View>
        <ScrollView style={styles.contentBody}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  navbar: {
    height: 80,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    } : {}),
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 40,
    maxWidth: 1400,
    marginHorizontal: 'auto',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  logoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF4B4B',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  activeNavLink: {
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
  },
  navLinkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
  },
  activeNavLinkText: {
    color: '#FF4B4B',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 80, // To account for fixed navbar
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
  },
  contentHeader: {
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  contentTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  contentBody: {
    flex: 1,
    paddingHorizontal: 40,
  },
}); 