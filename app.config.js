module.exports = {
  expo: {
    name: "kitchen-helper",
    slug: "kitchen-helper",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/app-icons/ios_icon_default_light.png",
    newArchEnabled: false,
    scheme: "myapp",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "xyz.kitchen-duyanhv.app",
    },
    android: {
      icon: "./assets/app-icons/android_icon_default_light.png",
      adaptiveIcon: {
        foregroundImage: "./assets/icon-android-foreground.png",
        monochromeImage: "./assets/icon-android-foreground.png",
        backgroundImage: "./assets/icon-android-background.png",
        backgroundColor: "#1185FE",
      },
      package: "xyz.kitchen_duyanhv.app",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "react-native-edge-to-edge",
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.1',
          },
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
          },
        },
      ],
      [
        "expo-splash-screen",
        {
          ios: {
            enableFullScreenImage_legacy: true,
            backgroundColor: "#ffffff",
            image: "./assets/splash.png",
            resizeMode: "cover",
            dark: {
              enableFullScreenImage_legacy: true,
              backgroundColor: "#001429",
              image: "./assets/splash-dark.png",
              resizeMode: "cover",
            },
          },
          android: {
            backgroundColor: "#0c7cff",
            image: "./assets/splash-android-icon.png",
            imageWidth: 150,
            dark: {
              backgroundColor: "#0c2a49",
              image: "./assets/splash-android-icon-dark.png",
              imageWidth: 150,
            },
          },
        },
      ],
      "expo-localization",
    ],
  },
};
