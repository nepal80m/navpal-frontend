import { ExpoConfig } from '@expo/config';

const config = {
  name: "navpal-frontend",
  slug: "navpal-frontend",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    infoPlist: {
      "Audio.setAudioModeAsync": "Please?",
      NSMicrophoneUsageDescription: "We need your permission to use the microphone for voice commands."
    },
    config: {
      googleMaps: {
        googleMapsApiKey: process.env.GOOGLE_MAP_API_KEY
      }
    }

  },
  android: {
    permissions: [
      "AUDIO_RECORD",
      "Audio.requestPermissionsAsync"
    ],
    config: {
      googleMaps: {
        apiKeys: process.env.GOOGLE_MAP_API_KEY
      }
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      }
    ],
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
      }
    ],
    [
      "expo-audio",
      {
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "eb296aed-f789-4b74-9fc8-87aa71592f36"
    }
  }
};

export default config;
