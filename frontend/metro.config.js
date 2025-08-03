const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable support for native modules
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-url-polyfill/auto': 'react-native-url-polyfill/auto.js',
};

// Support for new React Native architecture
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
