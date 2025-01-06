module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "@lingui/babel-plugin-lingui-macro",
      [
        'module-resolver',
        {
          alias: {
            // This needs to be mirrored in tsconfig.json
            '@': './src',
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
    env: {
      production: {
        plugins: ["transform-remove-console"],
      },
    },
  };
};
