const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // Fix SDK provider imports
  config.resolve.alias = {
    ...config.resolve.alias,
    '@multiversx/sdk-core/out/transaction': '@multiversx/sdk-core/out/transaction.js',
    '@multiversx/sdk-core/out/signature': '@multiversx/sdk-core/out/signature.js',
    '@multiversx/sdk-core/out/signableMessage': '@multiversx/sdk-core/out/signableMessage.js',
  };

  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "path": require.resolve("path-browserify"),
    "fs": false,
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url/"),
    "assert": require.resolve("assert/"),
    "buffer": require.resolve("buffer/"),
    "process": require.resolve("process/browser.js")
  };
  
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js'
    })
  );

  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  });
  
  return config;
};
