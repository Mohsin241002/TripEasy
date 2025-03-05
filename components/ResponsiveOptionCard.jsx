import React from 'react';
import { Platform } from 'react-native';
import MobileOptionCard from './CreateTrip/OptionCard';

export default function ResponsiveOptionCard(props) {
  // Only use the mobile version regardless of platform
  // This ensures the mobile UI is preserved
  return <MobileOptionCard {...props} />;
} 