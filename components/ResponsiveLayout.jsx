import React from 'react';
import { View } from 'react-native';

export default function ResponsiveLayout({ children, title, subtitle }) {
  // Always render the children as-is (preserving original mobile layout)
  // Web UI will be handled separately through app/components/web
  return <>{children}</>;
} 