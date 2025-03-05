import React from 'react';
import { View, StyleSheet, Text, ScrollView, Image, Platform } from 'react-native';

export default function WebLayout({ children, title, subtitle }) {
  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Trip Easy</Text>
        </View>
        <View style={styles.menuContainer}>
          <Text style={styles.menuItem}>🏠 Home</Text>
          <Text style={styles.menuItem}>🧳 My Trips</Text>
          <Text style={styles.menuItem}>✈️ Create Trip</Text>
          <Text style={styles.menuItem}>⭐ Explore</Text>
          <Text style={styles.menuItem}>👤 Profile</Text>
        </View>
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Trip Easy © 2023</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{title || 'Trip Easy'}</Text>
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.profileSection}>
            <Text style={styles.profileText}>👤 Account</Text>
          </View>
        </View>
        <ScrollView style={styles.contentScrollView}>
          <View style={styles.content}>
            {children}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    height: '100vh',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#eaeaea',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    color: '#ff6347',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    marginVertical: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    cursor: 'pointer',
  },
  footerContainer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'outfit',
  },
  mainContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#777',
    fontFamily: 'outfit',
    marginTop: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    marginLeft: 10,
  },
  contentScrollView: {
    flex: 1,
  },
  content: {
    padding: 30,
    maxWidth: 1200,
    margin: '0 auto',
  },
}); 