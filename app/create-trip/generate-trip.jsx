import { View, Text, Image, StyleSheet, StatusBar, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { CreateTripContext } from '../../context/CreateTripContext';
import { AI_PROMPT } from '../../constants/Options';
import { chatSession } from '../../configs/AiModal';
import { useRouter } from 'expo-router';
import { auth, db } from './../../configs/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';

export default function GenerateTrip() {
    const { tripData, setTripData } = useContext(CreateTripContext);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Starting trip generation...');
    const router = useRouter();
    const user = auth.currentUser;
    
    useEffect(() => {
        generateAiTrip()
        
        // Simulate progress for better UX
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 10;
            });
            
            // Update status messages based on progress
            if (progress < 20) {
                setStatusMessage('Gathering information about your destination...');
            } else if (progress < 40) {
                setStatusMessage('Creating personalized itinerary based on your preferences...');
            } else if (progress < 60) {
                setStatusMessage('Finding the best activities for your trip...');
            } else if (progress < 80) {
                setStatusMessage('Finalizing your travel plans...');
            } else {
                setStatusMessage('Almost done! Completing your itinerary...');
            }
        }, 2000);
        
        return () => clearInterval(interval);
    }, [])
    
    const generateAiTrip = async () => {
        try {
            setLoading(true);
            setStatusMessage('Generating your personalized trip...');
            
            const FINAL_PROMPT = AI_PROMPT.replace('{startingLocation}', tripData?.startingLocationInfo?.name)
                .replace('{location}', tripData?.locationInfo?.name)
                .replace('{startDate}', moment(tripData.startDate).format('MMM D, YYYY'))
                .replace('{endDate}', moment(tripData.endDate).format('MMM D, YYYY'))
                .replace('{totalDays}', tripData.totalNoOfDays)
                .replace('{totalNight}', tripData.totalNoOfDays - 1)
                .replace('{traveler}', tripData.traveler?.title)
                .replace('{budget}', tripData.budget)
                .replace('{totalDays}', tripData.totalNoOfDays)
                .replace('{totalNight}', tripData.totalNoOfDays - 1)

            console.log('Sending AI prompt:', FINAL_PROMPT);
            const result = await chatSession.sendMessage(FINAL_PROMPT);
            const responseText = result.response.text();
            console.log('AI response received');
            const tripResp = JSON.parse(responseText);
            setProgress(95);
            setStatusMessage('Saving your trip...');
            
            const docId = (Date.now()).toString();
            await setDoc(doc(db, 'UserTrips', docId), {
                userEmail: user.email,
                tripPlan: tripResp, // ai result
                tripData: JSON.stringify(tripData), // user selected data
                docId: docId,
                createdAt: new Date()
            })
            
            setProgress(100);
            setStatusMessage('Trip created successfully!');
            
            // Navigate to my trips screen
            setTimeout(() => {
                router.push('(tabs)/mytrip')
            }, 1000);
            
        } catch (error) {
            console.error('Error generating trip:', error);
            setStatusMessage('Something went wrong. Please try again.');
        }
    }
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            
            <SafeAreaView style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </SafeAreaView>
            
            <View style={styles.content}>
                <Text style={styles.title}>Creating Your Dream Trip</Text>
                
                <View style={styles.animationContainer}>
                    <Image 
                        source={require('./../../assets/images/plane.gif')}
                        style={styles.animation}
                    />
                </View>
                
                <Text style={styles.statusMessage}>{statusMessage}</Text>
                
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}% Complete</Text>
                </View>
                
                <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="large" color="#FF5A5F" />
                </View>
                
                <Text style={styles.warningText}>Please do not close the app or navigate away from this screen</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF5A5F',
    },
    header: {
        paddingTop: StatusBar.currentHeight || 44,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'outfit-bold',
        fontSize: 28,
        color: '#2D3748',
        textAlign: 'center',
        marginBottom: 32,
    },
    animationContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    animation: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    statusMessage: {
        fontFamily: 'outfit-medium',
        fontSize: 18,
        color: '#4A5568',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    progressContainer: {
        width: '100%',
        marginBottom: 36,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF5A5F',
        borderRadius: 4,
    },
    progressText: {
        fontFamily: 'outfit',
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
    },
    loadingIndicator: {
        marginBottom: 24,
    },
    warningText: {
        fontFamily: 'outfit',
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
        opacity: 0.7,
    },
});