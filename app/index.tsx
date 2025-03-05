import { View, Platform } from "react-native";
import React from 'react';
import Login from './../components/Login'
import {auth} from './../configs/firebaseConfig'
import { Redirect } from "expo-router";

export default function Index() {
    const user = auth.currentUser;
    
    // On web platform, redirect to the web routes
    if (Platform.OS === 'web') {
        // Redirect to the landing page directly
        if (typeof window !== 'undefined') {
            // Using window.location to avoid TypeScript issues
            window.location.href = '/(web)';
            return null;
        }
        return <View style={{ flex: 1 }}><Login /></View>;
    }
    
    // On mobile native platforms, show the original mobile UI
    return (
        <View style={{ flex: 1 }}>
            {user ? <Redirect href={'/mytrip'}/> : <Login/>}
        </View>
    );
}
