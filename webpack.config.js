var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const DEV_MODE = process.env.NODE_ENV !== 'production';
const IS_HASH = DEV_MODE ? '' : '.[contenthash]';
const STYLE_LOADER = DEV_MODE ? 'style-loader' : MiniCssExtractPlugin.loader;

module.exports = {
  entry: ['react-hot-loader/patch', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `static/js/[name]${IS_HASH}.js`,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [STYLE_LOADER, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/i,
        use: [STYLE_LOADER, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        // https://dwatow.github.io/2018/12-29-webpack/action-url-loader-file-loader/
        test: /\.(png|svg|jpg|gif|ttf)$/,
        use: {
          loader: 'url-loader',
          options: {
            esModule: false,
            // 1KB
            limit: 1024, //bytes
            name: `[name]${IS_HASH}`,
            outputPath: 'static/image/',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: `static/css/[name]${IS_HASH}.css`,
      chunkFilename: `static/css/[id]${IS_HASH}.css`,
    }),
  ],
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCssAssetsPlugin({})],
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        // https://www.ucamc.com/e-learning/javascript/357-webpack%E5%A6%82%E4%BD%95code-splitting%E6%8B%86%E5%88%86%E4%BB%A3%E7%A2%BCsplitchunks
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|@hot-loader|react-router|react-router-dom)/,
          name: 'react',
        },
        vendor: {
          test: /[\\/]node_modules[\\/](!react)(!@hot-loader)(!react-router)(!react-router-dom)/,
          name: 'vendors',
        },
      },
    },
  },
  devServer: {
    hot: true,
    stats: {
      children: false,
      maxModules: 0,
    },
  },
};
