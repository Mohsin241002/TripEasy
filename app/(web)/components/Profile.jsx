import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../../configs/firebaseConfig';
import { signOut, updateProfile } from 'firebase/auth';
import WebDashboardLayout from './WebDashboardLayout';

export default function WebProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          fullName: currentUser.displayName || 'User',
          email: currentUser.email,
          photoURL: currentUser.photoURL || 'https://via.placeholder.com/150'
        });
        setDisplayName(currentUser.displayName || '');
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

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

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'TripEasy',
            text: 'Check out this amazing travel planning app!',
            url: window.location.origin,
          });
        } else {
          // Fallback for browsers that don't support the Web Share API
          alert('Copy this link to share: ' + window.location.origin);
        }
      } else {
        await Share.share({
          message: 'Check out this amazing travel planning app! [App Link]',
        });
      }
    } catch (error) {
      console.error('Error sharing the app:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      alert('Please enter a display name');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: displayName
        });
        
        setUser({
          ...user,
          fullName: displayName
        });
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebDashboardLayout title="Profile">
      <View style={styles.container}>
        {user && (
          <>
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                  {isEditing ? (
                    <View style={styles.editNameContainer}>
                      <TextInput
                        style={styles.nameInput}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Enter your name"
                        placeholderTextColor="#A0AEC0"
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.saveButton]}
                          onPress={handleUpdateProfile}
                          disabled={loading}
                        >
                          <Text style={styles.editButtonText}>
                            {loading ? 'Saving...' : 'Save'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => {
                            setIsEditing(false);
                            setDisplayName(user.fullName);
                          }}
                          disabled={loading}
                        >
                          <Text style={styles.editButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.profileName}>{user.fullName}</Text>
                      <TouchableOpacity 
                        style={styles.editNameButton}
                        onPress={() => setIsEditing(true)}
                      >
                        <Ionicons name="pencil-outline" size={16} color="#718096" />
                        <Text style={styles.editNameText}>Edit Name</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>Account Settings</Text>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <View style={styles.actionIcon}>
                  <Ionicons name="share-social-outline" size={24} color="#4A5568" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Share App</Text>
                  <Text style={styles.actionDescription}>
                    Share this app with your friends and family
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
                <View style={styles.actionIcon}>
                  <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, styles.signOutText]}>Sign Out</Text>
                  <Text style={styles.actionDescription}>
                    Sign out from your account
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
              </TouchableOpacity>
            </View>

            <View style={styles.aboutCard}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>
                TripEasy is your personal travel companion, helping you plan and organize your trips with ease.
                Create custom itineraries, discover new destinations, and make your travel dreams a reality.
              </Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </>
        )}
      </View>
    </WebDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#718096',
  },
  editNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  editNameText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
  editNameContainer: {
    marginBottom: 12,
  },
  nameInput: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#2D3748',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  saveButton: {
    backgroundColor: '#FF4B4B',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#718096',
  },
  signOutText: {
    color: '#E53E3E',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  aboutText: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
}); 