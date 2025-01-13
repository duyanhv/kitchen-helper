const linguiTransformer = require("@lingui/metro-transformer/expo");
const svgTransformer = require("react-native-svg-transformer");
const metroBabelTransformer = require("@react-native/metro-babel-transformer");

module.exports.transform = function ({ src, filename, options }) {
  if (filename.endsWith(".po") || filename.endsWith(".pot")) {
    return linguiTransformer.transform({ src, filename, options });
  }
  if (filename.endsWith(".svg")) {
    return svgTransformer.transform({ src, filename, options });
  }
  return metroBabelTransformer.transform({ src, filename, options });
};