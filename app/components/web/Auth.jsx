import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../../configs/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Navbar from './Navbar';

export default function WebAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showError = (message) => {
    setError(message);
    if (Platform.OS === 'web') {
      alert(message);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed in:', user.uid);
      router.replace('/mytrip');
    } catch (error) {
      console.error('Sign in error:', error.code, error.message);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      showError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created:', user.uid);
      router.replace('/mytrip');
    } catch (error) {
      console.error('Sign up error:', error.code, error.message);
      
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters';
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <Navbar />
      <View style={styles.container}>
        <View style={[styles.formContainer, styles.elevation]}>
          {/* Banner Panel */}
          <View style={[
            styles.bannerPanel,
            isSignUp ? styles.bannerPanelRight : styles.bannerPanelLeft
          ]}>
            <Text style={styles.bannerTitle}>
              {isSignUp ? 'Welcome Back!' : 'Hello, Friend!'}
            </Text>
            <Text style={styles.bannerText}>
              {isSignUp 
                ? 'Already have an account? Sign in to continue your journey.'
                : 'Start your journey with us by creating a free account.'}
            </Text>
            <TouchableOpacity 
              style={styles.bannerButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
            >
              <Text style={styles.bannerButtonText}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In/Up Form */}
          <View style={[
            styles.formPanel,
            isSignUp ? styles.formPanelLeft : styles.formPanelRight
          ]}>
            <View style={styles.form}>
              <Text style={styles.formTitle}>
                {!isSignUp ? 'Sign In' : 'Create Account'}
              </Text>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              {isSignUp && (
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#666"
                  value={fullName}
                  onChangeText={setFullName}
                />
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              
              {isSignUp && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              )}
              
              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={!isSignUp ? handleSignIn : handleSignUp}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Please wait...' : (!isSignUp ? 'Sign In' : 'Sign Up')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 90px)',
    paddingTop: 90, // Account for navbar height
  },
  formContainer: {
    width: '80%',
    maxWidth: 1000,
    height: 600,
    backgroundColor: '#fff',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      display: 'flex',
      flexDirection: 'row',
    } : {}),
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerPanel: {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: '100%',
    backgroundColor: '#FF4B4B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.6s ease-in-out',
    } : {}),
  },
  bannerPanelLeft: {
    left: 0,
  },
  bannerPanelRight: {
    right: 0,
  },
  formPanel: {
    position: 'absolute',
    top: 0,
    width: '60%',
    height: '100%',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.6s ease-in-out',
    } : {}),
    padding: 40,
    justifyContent: 'center',
  },
  formPanelLeft: {
    left: 0,
  },
  formPanelRight: {
    right: 0,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  bannerText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  bannerButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 30,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF4B4B',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    } : {}),
  },
  submitButtonDisabled: {
    backgroundColor: '#FF8080',
    ...(Platform.OS === 'web' ? {
      cursor: 'not-allowed',
    } : {}),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 