const path = require("path");

const config = {
  entry: {
    main: ["./src/main.tsx"],
  },
  optimization: {
    usedExports: true,
  },
  devtool: "source-map",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "../static/js"),
    filename: "[name].min.js",
    clean: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
        },
        exclude: /node_modules/,
        include: path.join(__dirname, "src"),
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
        exclude: /node_modules/,
        include: path.join(__dirname, "src"),
      },
    ],
  },
  cache: {
    type: "filesystem",
  },
};

module.exports = config;