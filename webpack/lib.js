const { TARGET, LIB } = require('./paths');
const { LIB_CSS, LIB_JS } = require('./config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: LIB,
  output: {
    path: TARGET,
    filename: LIB_JS,
    library: 'GoResultsHighlighter',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: LIB_CSS
    })
  ],
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
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  target: 'web'
};