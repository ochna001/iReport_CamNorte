// Dynamic Expo config that reads from environment variables
// This replaces hardcoded values in app.json with env variables

export default ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      'expo-web-browser',
    ],
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        },
      },
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      },
    },
  };
};
