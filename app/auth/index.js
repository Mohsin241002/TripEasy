import React from 'react';
import { Redirect } from 'expo-router';

export default function Auth() {
  // Redirect to the sign-in page
  return <Redirect href="/auth/sign-in" />;
} 