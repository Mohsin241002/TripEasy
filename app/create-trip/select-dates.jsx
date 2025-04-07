import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert, Platform } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router';
import CalendarPicker from "react-native-calendar-picker";
import moment from 'moment';
import { CreateTripContext } from '../../context/CreateTripContext';
import { Ionicons } from '@expo/vector-icons';

export default function SelectDates() {
    const navigation = useNavigation();
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const { tripData, setTripData } = useContext(CreateTripContext);
    const router = useRouter();
    
    useEffect(() => {
        navigation.setOptions({
          headerShown: false
        });
    }, []);

    const onDateChange = (date, type) => {
        if (type == 'START_DATE') {
            setStartDate(moment(date))
        } else {
            setEndDate(moment(date))
        }
    }
    
    const handleContinue = () => {
        if (!startDate || !endDate) {
            if (Platform.OS === 'android') {
                Alert.alert('Please select both start and end dates');
            } else {
                Alert.alert('Missing Dates', 'Please select both start and end dates');
            }
            return;
        }
        
        const totalNoOfDays = endDate.diff(startDate, 'days');
        
        setTripData({
            ...tripData,
            startDate: startDate,
            endDate: endDate,
            totalNoOfDays: totalNoOfDays + 1
        });
        
        router.push('/create-trip/select-budget');
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
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '60%' }]} />
                    </View>
                    <Text style={styles.progressText}>Step 3 of 5</Text>
                </View>
                
                <Text style={styles.title}>Select Travel Dates</Text>
                <Text style={styles.subtitle}>Choose the start and end dates for your trip</Text>
                
                <View style={styles.calendarContainer}>
                    <CalendarPicker 
                        onDateChange={onDateChange}
                        allowRangeSelection={true} 
                        minDate={new Date()}
                        maxRangeDuration={10}
                        selectedRangeStyle={{
                            backgroundColor: '#4F46E5'
                        }}
                        selectedDayColor="#4F46E5"
                        selectedDayTextColor="#FFFFFF"
                        todayBackgroundColor="#F7FAFC"
                        todayTextStyle={{
                            color: '#4F46E5'
                        }}
                        textStyle={{
                            fontFamily: 'outfit',
                            color: '#4A5568'
                        }}
                        headerTextStyle={{
                            fontFamily: 'outfit-bold',
                            color: '#2D3748'
                        }}
                        previousComponent={
                            <Ionicons name="chevron-back" size={24} color="#4F46E5" />
                        }
                        nextComponent={
                            <Ionicons name="chevron-forward" size={24} color="#4F46E5" />
                        }
                    />
                </View>
                
                <View style={styles.dateInfoContainer}>
                    {startDate && endDate && (
                        <Text style={styles.dateInfo}>
                            <Text style={styles.dateInfoLabel}>Duration: </Text>
                            {endDate.diff(startDate, 'days') + 1} days, {endDate.diff(startDate, 'days')} nights
                        </Text>
                    )}
                </View>
                
                <TouchableOpacity 
                    onPress={handleContinue}
                    style={[styles.continueButton, (!startDate || !endDate) && styles.buttonDisabled]}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
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
    calendarContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    dateInfoContainer: {
        marginTop: 16,
        marginBottom: 16,
        minHeight: 20,
    },
    dateInfo: {
        fontFamily: 'outfit',
        fontSize: 16,
        color: '#4A5568',
        textAlign: 'center',
    },
    dateInfoLabel: {
        fontFamily: 'outfit-medium',
    },
    continueButton: {
        backgroundColor: '#FF5A5F',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    continueButtonText: {
        color: 'white',
        fontFamily: 'outfit-bold',
        fontSize: 16,
    },
});