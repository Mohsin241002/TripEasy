import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { SelectBudgetOptions } from "../../constants/Options";
import OptionCard from "../../components/ResponsiveOptionCard";
import { CreateTripContext } from "../../context/CreateTripContext";
import { Ionicons } from "@expo/vector-icons";

export default function SelectBudget() {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState();
  const { tripData, setTripData } = useContext(CreateTripContext);
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  useEffect(() => {
    if (selectedOption) {
      setTripData({
        ...tripData,
        budget: selectedOption?.title,
      });
    }
  }, [selectedOption]);

  const handleContinue = () => {
    if (!selectedOption) {
      if (Platform.OS === 'android') {
        Alert.alert('Please select a budget option');
      } else {
        Alert.alert('Budget Required', 'Please select a budget option to continue');
      }
      return;
    }
    router.push("/create-trip/review-trip");
  };

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
            <View style={[styles.progressFill, { width: '80%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 5</Text>
        </View>
        
        <Text style={styles.title}>Budget</Text>
        <Text style={styles.subtitle}>Choose your spending habits for this trip</Text>
        
        <FlatList
          data={SelectBudgetOptions}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.optionsList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedOption(item)}
              style={styles.optionCard}
            >
              <OptionCard option={item} selectedOption={selectedOption} />
            </TouchableOpacity>
          )}
        />
        
        <TouchableOpacity
          onPress={handleContinue}
          style={[styles.continueButton, !selectedOption && styles.buttonDisabled]}
          disabled={!selectedOption}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4C669F',
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
  optionsList: {
    paddingBottom: 20,
  },
  optionCard: {
    marginVertical: 8,
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
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
