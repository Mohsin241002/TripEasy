import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, Platform } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../../configs/firebaseConfig';
import WebSignUp from '../../components/web/SignUp';

export default function SignUp() {
  // On web platform, use the web sign-up component
  if (Platform.OS === 'web') {
    return <WebSignUp />;
  }

  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onCreateAccount = async () => {
    // Form validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (!password) {
      setError('Please enter a password');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with full name
      await updateProfile(user, {
        displayName: fullName
      });
      
      console.log('User account created:', user.uid);
      router.replace('/mytrip');
    } catch (error) {
      console.error('Sign up error:', error.code, error.message);
      
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      setError(errorMessage);
      if (Platform.OS === 'android') {
        Alert.alert('Sign Up Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/auth/sign-in')}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create Account</Text>
          <Text style={styles.subHeaderText}>Sign up to start planning your trips</Text>
        </View>
        
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your full name" 
              placeholderTextColor="#A0AEC0"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your email" 
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput 
              secureTextEntry={true} 
              style={styles.input} 
              placeholder="Create a password" 
              placeholderTextColor="#A0AEC0"
              value={password}
              onChangeText={setPassword}
            />
            <Text style={styles.passwordHint}>Must be at least 6 characters</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.createAccountButton, loading && styles.buttonDisabled]} 
            onPress={onCreateAccount}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createAccountButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('auth/sign-in')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4C669F',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerText: {
    fontFamily: 'outfit-bold',
    fontSize: 32,
    color: 'white',
    marginBottom: 10,
  },
  subHeaderText: {
    fontFamily: 'outfit',
    color: '#E2E8F0',
    fontSize: 18,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: '#E53E3E',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'outfit',
    color: '#4A5568',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    padding: 15,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    fontFamily: 'outfit',
    color: '#2D3748',
    fontSize: 16,
  },
  passwordHint: {
    fontFamily: 'outfit',
    color: '#718096',
    fontSize: 12,
    marginTop: 4,
  },
  createAccountButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 50,
  },
  buttonDisabled: {
    backgroundColor: '#FEB2B2',
  },
  createAccountButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: 'outfit',
    color: '#718096',
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    fontFamily: 'outfit-bold',
    color: '#4C669F',
    fontSize: 14,
  },
});