const path = require("path");
const webpack = require("webpack");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");

module.exports = {
  entry: {
    "sparql-service": path.join(__dirname, './src/sparql-service.ts'),
    "sparql-service.min": path.join(__dirname, './src/sparql-service.ts')
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
    library: 'sparql-service',
    libraryTarget: 'umd'
  },
  devtool: "source-map",
  module: {
    rules: [ {
	    test: /\.ts$/,
	    use: [ 'ng-annotate-loader', {
        loader: 'ts-loader',
        options: {
          configFileName: 'tsconfig-dist.json'
        }
      }]
    } ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: {
    angular: 'angular'
  },
  plugins: [
    new WebpackBuildNotifierPlugin({
      title: "sparql-service Webpack Build"
    }),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};
