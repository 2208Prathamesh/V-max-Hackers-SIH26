const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable worker threads to prevent Node 24 V8 thread memory allocation bug on Windows
config.transformer.unstable_workerThreads = false;
config.maxWorkers = 2;

module.exports = config;
