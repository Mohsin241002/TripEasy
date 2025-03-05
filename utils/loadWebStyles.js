import { Platform } from 'react-native';

// Function to dynamically load web-specific CSS
export function loadWebStyles() {
  if (Platform.OS === 'web') {
    // Only execute on web platform
    try {
      // Create a link element
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = '/assets/web-styles.css';
      
      // Append to the head
      document.head.appendChild(linkElement);
      
      console.log('Web styles loaded successfully');
    } catch (error) {
      console.error('Failed to load web styles:', error);
    }
  }
} 