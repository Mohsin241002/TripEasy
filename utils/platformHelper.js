import { Platform, Dimensions } from 'react-native';

// Get window dimensions
const { width, height } = Dimensions.get('window');

// Determine if it's web and desktop-sized (not mobile web)
export const isWebDesktop = Platform.OS === 'web' && width > 768;

// Determine if it's mobile (native or mobile web)
export const isMobile = Platform.OS !== 'web' || (Platform.OS === 'web' && width <= 768);

// Function to conditionally render components based on platform
export const PlatformSpecific = ({ web, mobile, children }) => {
  if (isWebDesktop && web) {
    return web;
  } else if (isMobile && mobile) {
    return mobile;
  }
  return children;
};

// Function to get platform-specific styles
export const getPlatformStyles = (webStyles, mobileStyles) => {
  return isWebDesktop ? webStyles : mobileStyles;
}; 