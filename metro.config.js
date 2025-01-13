// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require("@react-native/metro-config");

const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const customConfig = {
  transformer: {
    babelTransformerPath: require.resolve("./custom-transformer"),
  },
  resolver: {
    assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...config.resolver.sourceExts, "po", "pot", "svg"],
  },
};
module.exports = wrapWithReanimatedMetroConfig(
  mergeConfig(config, customConfig)
);
