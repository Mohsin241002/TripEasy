import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Hero from './Hero';
import Features from './Features';
import Navbar from './Navbar';

export default function Landing() {
  return (
    <View style={styles.mainContainer}>
      <Navbar />
      <ScrollView style={styles.container}>
        <Hero />
        <Features />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 90, // Add margin to account for fixed navbar height
  },
}); 