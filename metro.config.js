const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure compatibility with web
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

module.exports = config;
