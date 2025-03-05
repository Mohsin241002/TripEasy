import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import WebDiscover from './components/Discover';

export default function DiscoverPage() {
  const auth = getAuth();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  // If user is not logged in, redirect to the landing page
  if (!user) {
    return <Redirect href="../(web)" />;
  }

  // If user is logged in, show the Discover page
  return <WebDiscover />;
} 