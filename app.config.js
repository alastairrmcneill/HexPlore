export default {
  expo: {
    name: "HexPlore",
    slug: "HexPlore",
    version: "1.2.2",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "hexplore",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.alastair.r.mcneill.HexPlore",
      requiresFullScreen: true,
      buildNumber: "5",
      appleTeamId: "4R5HGU4283",
    },
    web: {
      output: "static",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#FAFAF7",
          dark: {
            backgroundColor: "#FAFAF7",
          },
        },
      ],
      "@maplibre/maplibre-react-native",
      "expo-sqlite",
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "HexPlore uses your location to reverse-geocode hex cells you've visited.",
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission:
            "HexPlore reads the location of your photos to map the places you've visited. No photos or location data leave your device.",
          savePhotosPermission: "Allow HexPlore to save photos.",
        },
      ],
      "./plugins/withPhotoLocationScanner",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
      maptilerKey: process.env.MAPTILER_KEY,
    },
  },
};
