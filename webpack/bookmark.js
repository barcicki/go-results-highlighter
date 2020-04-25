const { TARGET, BOOKMARK } = require('./paths');
const { BOOKMARK_JS } = require('./config');

module.exports = {
  entry: BOOKMARK,
  output: {
    path: TARGET,
    filename: BOOKMARK_JS
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  target: 'web'
};