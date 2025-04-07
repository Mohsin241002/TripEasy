import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CreateTripContext } from '../../context/CreateTripContext';
import moment from 'moment';

export default function ReviewTrip() {
    const navigation = useNavigation();
    const { tripData, setTripData } = useContext(CreateTripContext);
    const router = useRouter();
    
    useEffect(() => {
        navigation.setOptions({
          headerShown: false
        });
    }, []);

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
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
                    <Text style={styles.progressText}>Step 5 of 5</Text>
                </View>
                
                <Text style={styles.title}>Review Your Trip</Text>
                <Text style={styles.subtitle}>Before generating your trip, please review your selection</Text>
                
                <View style={styles.reviewItemsContainer}>
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewItemIcon}>📍</Text>
                        <View style={styles.reviewItemContent}>
                            <Text style={styles.reviewItemLabel}>Destination</Text>
                            <Text style={styles.reviewItemValue}>{tripData.locationInfo?.name}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewItemIcon}>📅</Text>
                        <View style={styles.reviewItemContent}>
                            <Text style={styles.reviewItemLabel}>Travel Date</Text>
                            <Text style={styles.reviewItemValue}>
                                {moment(tripData?.startDate).format('DD/MMM') + " To " + moment(tripData?.endDate).format('DD/MMM') + " "}
                                ({tripData?.totalNoOfDays} days)
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewItemIcon}>👨‍👩‍👦</Text>
                        <View style={styles.reviewItemContent}>
                            <Text style={styles.reviewItemLabel}>Who is Traveling</Text>
                            <Text style={styles.reviewItemValue}>{tripData?.traveler?.title}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.reviewItem}>
                        <Text style={styles.reviewItemIcon}>💰</Text>
                        <View style={styles.reviewItemContent}>
                            <Text style={styles.reviewItemLabel}>Budget</Text>
                            <Text style={styles.reviewItemValue}>{tripData?.budget}</Text>
                        </View>
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={() => router.replace('/create-trip/generate-trip')}
                >
                    <Text style={styles.continueButtonText}>Build My Trip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
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
        padding: 20,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4F46E5',
        borderRadius: 3,
    },
    progressText: {
        fontFamily: 'outfit',
        fontSize: 14,
        color: '#718096',
    },
    title: {
        fontFamily: 'outfit-bold',
        fontSize: 28,
        color: '#2D3748',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'outfit',
        fontSize: 16,
        color: '#718096',
        marginBottom: 24,
    },
    reviewItemsContainer: {
        marginTop: 20,
    },
    reviewItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 25,
    },
    reviewItemIcon: {
        fontSize: 28,
        marginRight: 20,
    },
    reviewItemContent: {
        flex: 1,
    },
    reviewItemLabel: {
        fontFamily: 'outfit',
        fontSize: 16,
        color: '#808080',
        marginBottom: 4,
    },
    reviewItemValue: {
        fontFamily: 'outfit-medium',
        fontSize: 16,
        color: '#2D3748',
    },
    continueButton: {
        backgroundColor: '#FF5A5F',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    continueButtonText: {
        color: 'white',
        fontFamily: 'outfit-bold',
        fontSize: 16,
    },
});