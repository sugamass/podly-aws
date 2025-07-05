const path = require("path");
const slsw = require("serverless-webpack");

module.exports = {
  entry: slsw.lib.entries,
  target: "node",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, ".webpack/service"),
    libraryTarget: "commonjs2",
  },
  externals: {
    "aws-sdk": "aws-sdk",
    "fluent-ffmpeg": "fluent-ffmpeg",
  },
  optimization: {
    minimize: process.env.NODE_ENV === "production",
    usedExports: true,
    sideEffects: false,
  },
  stats: "minimal",
  devtool: process.env.NODE_ENV === "production" ? false : "source-map",
};
