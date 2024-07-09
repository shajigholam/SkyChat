// const {getDefaultConfig} = require("@expo/metro-config");

// const defaultConfig = getDefaultConfig(__dirname);

// defaultConfig.resolver.assetExts.push(
//   // Adds support for `.db` files for SQLite databases
//   "cjs"
// );

// module.exports = defaultConfig;

const {getDefaultConfig} = require("expo/metro-config");
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push("cjs");
module.exports = defaultConfig;
