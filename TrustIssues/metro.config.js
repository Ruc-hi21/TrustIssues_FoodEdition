const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve to CommonJS/react-native versions first
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
