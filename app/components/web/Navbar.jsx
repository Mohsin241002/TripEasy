import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../../configs/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const router = useRouter();
  const user = auth.currentUser;

  const handleAuthNavigation = () => {
    router.push('/auth');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
      if (Platform.OS === 'web') {
        alert('Failed to sign out. Please try again.');
      }
    }
  };

  const handleSignInNavigation = () => {
    router.push('/auth/sign-in');
  };

  const handleSignUpNavigation = () => {
    router.push('/auth/sign-up');
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.logo} onPress={() => router.push('/')}>
          <Ionicons name="airplane" size={28} color="#FF4B4B" />
          <Text style={styles.logoText}>TripEasy</Text>
        </TouchableOpacity>

        <View style={styles.authButtons}>
          {user ? (
            <>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => router.push('/mytrip')}
              >
                <Text style={styles.navButtonText}>My Trips</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={handleSignInNavigation}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={handleSignUpNavigation}
              >
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 90,
    backgroundColor: '#fff',
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
  container: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  logoText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#FF4B4B',
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
  },
  signInButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4B4B',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255, 75, 75, 0.1)',
      },
    } : {}),
  },
  signUpButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FF4B4B',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#FF3333',
      },
    } : {}),
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FF4B4B',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#FF3333',
      },
    } : {}),
  },
  signInText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4B4B',
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
}); 