const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postCssPresetEnv = require('postcss-preset-env');

const buildMode = process.env.NODE_ENV || 'development';
const isDevMode = buildMode === 'development';
const target = isDevMode ? 'web' : 'browserslist';
const devtool = isDevMode ? 'source-map' : undefined;

module.exports = {
  entry: ['@babel/polyfill', './src/script/index.js'],
  mode: buildMode,
  target,
  devtool,
  devServer: {
    port: 3000,
    open: true,
    hot: true,
  },
  output: {
    filename: 'main.js',
    assetModuleFilename: 'assets/[name][ext][query]',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'layout', 'index.html'),
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.s?css$/i,
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [postCssPresetEnv],
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
            ],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
      },
    ],
  },
};
