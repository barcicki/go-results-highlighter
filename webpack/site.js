const path = require('path');
const pkg = require('../package.json');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const octicons = require('@primer/octicons');

const { TARGET, SITE, PAGES } = require('./paths');
const { BOOKMARK_JS, SITE_JS, SITE_CSS, LIB_JS, LIB_CSS } = require('./config');

const bookmark = fs.readFileSync(path.join(TARGET, BOOKMARK_JS), 'utf-8');

module.exports = {
  entry: SITE,
  output: {
    path: TARGET,
    filename: SITE_JS
  },
  plugins: [
    new CopyPlugin([
      { from: path.join(SITE, 'assets'), to: path.join(TARGET, 'assets') }
    ]),
    new MiniCssExtractPlugin({
      filename: SITE_CSS
    })
  ],
  devServer: {
    contentBase: TARGET
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
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.jade|pug$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name(resourcePath) {
                return path.relative(PAGES, resourcePath)
                  .replace(path.extname(resourcePath), '.html');
              }
            }
          },
          {
            loader: 'pug-html-loader',
            options: {
              pretty: true,
              data: {
                pkg,
                bookmark,
                octicons,
                libJs: LIB_JS,
                libCss: LIB_CSS,
                siteJs: SITE_JS,
                siteCss: SITE_CSS
              }
            }
          }
        ]
      }
    ]
  },
  target: 'web'
};
