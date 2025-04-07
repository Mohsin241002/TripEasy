import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebDashboardLayout from './WebDashboardLayout';
import { getLocationDetails } from '../../../configs/locationDetailsAI';

const LocationDetails = ({ route, navigation, onBack, onRefresh }) => {
  const { location, details, loading } = route?.params || {};
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [displayError, setDisplayError] = React.useState(null);
  
  const handleRefresh = async () => {
    if (onRefresh && location) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Error refreshing data:", error);
        setDisplayError("Failed to refresh data. Please try again later.");
        Alert.alert(
          "Error Refreshing Data",
          "There was a problem getting fresh data. Please try again later."
        );
      } finally {
        setIsRefreshing(false);
      }
    }
  };
  
  // Function to test API directly
  const testApiDirectly = async () => {
    if (!location) return;
    
    setIsRefreshing(true);
    try {
      console.log("Testing API directly for:", location.name, location.country);
      const result = await getLocationDetails(location.name, location.country);
      console.log("Direct API test result:", result);
      Alert.alert(
        "API Test Result",
        result ? "API call successful! Check console for details." : "API call returned no data."
      );
    } catch (error) {
      console.error("Direct API test error:", error);
      Alert.alert(
        "API Test Error",
        `Error: ${error.message}`
      );
    } finally {
      setIsRefreshing(false);
    }
  };
  
  if (loading || isRefreshing) {
    return (
      <WebDashboardLayout title={`${isRefreshing ? 'Refreshing' : 'Loading'} ${location?.name || ''} Info`}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>
            {isRefreshing ? 'Refreshing data...' : `Loading information about ${location?.name || 'this location'}...`}
          </Text>
          <Text style={styles.loadingSubtext}>This may take a few moments</Text>
        </View>
      </WebDashboardLayout>
    );
  }
  
  if (!details || details.error) {
    return (
      <WebDashboardLayout title="Location Details">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to load location details</Text>
          <Text style={styles.errorText}>{displayError || details?.message || "Something went wrong. Please try again."}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.refreshButton, styles.refreshErrorButton]} 
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.refreshErrorText}>Try Again</Text>
            </TouchableOpacity>
          </View>
          
          {/* Debug button for direct API testing */}
          <TouchableOpacity 
            style={styles.apiTestButton}
            onPress={testApiDirectly}
          >
            <Ionicons name="code-working" size={18} color="#FFFFFF" />
            <Text style={styles.apiTestButtonText}>Test API Directly</Text>
          </TouchableOpacity>
          
          <Text style={styles.debugNote}>
            Error details have been logged to the console.
          </Text>
        </View>
      </WebDashboardLayout>
    );
  }
  
  // Safely access data with fallback
  const getAccommodation = (type) => {
    try {
      return details.cost_estimates?.accommodation?.[type] || 'Not available';
    } catch (e) {
      return 'Not available';
    }
  };
  
  return (
    <WebDashboardLayout title={`${location?.name || 'Location'} Travel Guide`}>
      <ScrollView style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#4F46E5" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Ionicons name="refresh" size={16} color="#4F46E5" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {/* Location header */}
        <View style={styles.locationHeader}>
          {location?.imageUrl && (
            <Image
              source={{ uri: location.imageUrl }}
              style={styles.locationImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.locationTitleContainer}>
            <Text style={styles.locationName}>{location?.name}</Text>
            <Text style={styles.locationCountry}>{location?.country}</Text>
          </View>
        </View>
        
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.introductionText}>{details.introduction}</Text>
        </View>
        
        {/* Famous Dishes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Famous Local Cuisine</Text>
          {Array.isArray(details.famous_dishes) && details.famous_dishes.map((dish, index) => (
            <View key={`dish-${index}`} style={styles.dishItem}>
              <Text style={styles.dishName}>{dish.name}</Text>
              <Text style={styles.dishDescription}>{dish.description}</Text>
            </View>
          ))}
          {!Array.isArray(details.famous_dishes) && (
            <Text style={styles.noDataText}>No cuisine information available</Text>
          )}
        </View>
        
        {/* Places to Visit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Places to Visit</Text>
          {Array.isArray(details.places_to_visit) && details.places_to_visit.map((place, index) => (
            <View key={`place-${index}`} style={styles.placeItem}>
              <Text style={styles.placeName}>
                {place.name}
                {place.visit_duration && (
                  <Text style={styles.visitDuration}> • {place.visit_duration}</Text>
                )}
              </Text>
              <Text style={styles.placeDescription}>{place.description}</Text>
            </View>
          ))}
          {!Array.isArray(details.places_to_visit) && (
            <Text style={styles.noDataText}>No places to visit information available</Text>
          )}
        </View>
        
        {/* Cost Estimates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Estimates (7 Days)</Text>
          
          <View style={styles.costCategory}>
            <Text style={styles.costCategoryTitle}>Accommodation</Text>
            <View style={styles.accommodationOptions}>
              <View style={styles.accommodationOption}>
                <Text style={styles.accommodationOptionTitle}>Budget</Text>
                <Text style={styles.accommodationOptionPrice}>
                  {getAccommodation('budget')}
                </Text>
              </View>
              <View style={styles.accommodationOption}>
                <Text style={styles.accommodationOptionTitle}>Mid-range</Text>
                <Text style={styles.accommodationOptionPrice}>
                  {getAccommodation('mid_range')}
                </Text>
              </View>
              <View style={styles.accommodationOption}>
                <Text style={styles.accommodationOptionTitle}>Luxury</Text>
                <Text style={styles.accommodationOptionPrice}>
                  {getAccommodation('luxury')}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.costItem}>
            <Text style={styles.costItemTitle}>Food (per day)</Text>
            <Text style={styles.costItemValue}>{details.cost_estimates?.food_per_day || 'Not available'}</Text>
          </View>
          
          <View style={styles.costItem}>
            <Text style={styles.costItemTitle}>Local Transportation</Text>
            <Text style={styles.costItemValue}>{details.cost_estimates?.local_transportation || 'Not available'}</Text>
          </View>
          
          <View style={styles.costItem}>
            <Text style={styles.costItemTitle}>Sightseeing & Activities</Text>
            <Text style={styles.costItemValue}>{details.cost_estimates?.sightseeing_activities || 'Not available'}</Text>
          </View>
          
          <View style={styles.totalCost}>
            <Text style={styles.totalCostTitle}>Total Estimated Cost (7 days)</Text>
            <Text style={styles.totalCostValue}>{details.cost_estimates?.total_estimate || 'Not available'}</Text>
          </View>
        </View>
        
        {/* Trip planning button */}
        <TouchableOpacity 
          style={styles.planTripButton}
          onPress={() => {
            // Navigate to create trip with pre-filled destination
            if (navigation) {
              navigation.push({
                pathname: '../(web)/create-trip',
                params: { 
                  destination: location.name, 
                  country: location.country 
                }
              });
            }
          }}
        >
          <Text style={styles.planTripButtonText}>Plan a Trip to {location?.name}</Text>
        </TouchableOpacity>
      </ScrollView>
    </WebDashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 10,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#718096',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    marginLeft: 4,
  },
  locationHeader: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationImage: {
    width: '100%',
    height: 300,
  },
  locationTitleContainer: {
    padding: 16,
  },
  locationName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  locationCountry: {
    fontSize: 18,
    color: '#4A5568',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  introductionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5568',
  },
  dishItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  dishDescription: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
  },
  placeItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  visitDuration: {
    fontWeight: 'normal',
    fontSize: 15,
    color: '#718096',
  },
  placeDescription: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
  },
  costCategory: {
    marginBottom: 20,
  },
  costCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  accommodationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  accommodationOption: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    width: '31%',
    marginBottom: 10,
  },
  accommodationOptionTitle: {
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 4,
  },
  accommodationOptionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  costItemTitle: {
    fontSize: 16,
    color: '#4A5568',
  },
  costItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  totalCost: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginTop: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  totalCostTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C5282',
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
  },
  backButton: {
    backgroundColor: '#F7FAFC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refreshErrorButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  refreshErrorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  planTripButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  planTripButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  apiTestButton: {
    backgroundColor: '#64748B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  apiTestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  debugNote: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LocationDetails; 