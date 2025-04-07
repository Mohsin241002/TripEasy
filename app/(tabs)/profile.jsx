import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Share, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './../../configs/firebaseConfig';
import { updateProfile, signOut } from 'firebase/auth';

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          fullName: currentUser.displayName || 'User',
          email: currentUser.email,
          photoURL: currentUser.photoURL || null
        });
        setDisplayName(currentUser.displayName || '');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('Sign-out successful');
      router.replace('/auth/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share({
          title: 'TripEasy',
          text: 'Check out this amazing travel planning app!',
          url: window.location.origin,
        });
      } else {
        await Share.share({
          message: 'Check out TripEasy - the ultimate travel planning app developed by Mohsin Chunawala!',
        });
      }
    } catch (error) {
      console.error('Error sharing the app:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    setUpdateLoading(true);
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
        Alert.alert('Success', 'Your profile has been updated!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.notSignedInContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#CBD5E0" />
        <Text style={styles.notSignedInText}>You're not signed in</Text>
        <TouchableOpacity 
          style={styles.signInButton} 
          onPress={() => router.replace('/auth/sign-in')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image 
            source={user.photoURL ? { uri: user.photoURL } : require('./../../assets/images/pl.jpg')} 
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
                    disabled={updateLoading}
                  >
                    <Text style={styles.editButtonText}>
                      {updateLoading ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => {
                      setIsEditing(false);
                      setDisplayName(user.fullName);
                    }}
                    disabled={updateLoading}
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
        <Text style={styles.creatorText}>Created by Mohsin Chunawala</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  notSignedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  notSignedInText: {
    fontFamily: 'outfit-medium',
    fontSize: 18,
    color: '#4A5568',
    marginBottom: 20,
    marginTop: 10,
  },
  signInButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: 200,
  },
  signInButtonText: {
    color: 'white',
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 28,
    marginBottom: 20,
    color: '#2D3748',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    color: '#2D3748',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#718096',
  },
  editNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  editNameText: {
    color: '#FF5A5F',
    fontSize: 14,
    marginLeft: 4,
    fontFamily: 'outfit-medium',
  },
  editNameContainer: {
    marginBottom: 8,
  },
  nameInput: {
    padding: 8,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    fontFamily: 'outfit',
    color: '#2D3748',
    fontSize: 16,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#EDF2F7',
  },
  saveButton: {
    backgroundColor: '#FF5A5F',
    marginRight: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'outfit-medium',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: '#2D3748',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 2,
  },
  actionDescription: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: '#718096',
  },
  signOutText: {
    color: '#FF5A5F',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  aboutText: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 16,
  },
  versionText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  creatorText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: '#718096',
  },
});

export default Profile;
