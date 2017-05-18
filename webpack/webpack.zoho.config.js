const path = require('path')
module.exports = {
  entry: ['babel-polyfill', path.resolve(__dirname, '../source/index.js')],
  output: {
    filename: 'zoho.js',
    path: path.resolve(__dirname, '../build/'),
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['es2015','react'],
          plugins: ['syntax-dynamic-import', 'transform-async-to-generator', 'transform-regenerator']
        }
      }]
    }]
  },
  target: 'node'
};
