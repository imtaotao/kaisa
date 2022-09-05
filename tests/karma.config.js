const path = require("path");

module.exports = (config) => {
  config.set({
    singleRun: true,
    browsers: ["Chrome"],
    frameworks: ["jasmine"],
    reporters: ["progress", "mocha"],
    colors: {
      error: "bgRed",
      info: "bgGreen",
      success: "blue",
      warning: "cyan",
    },
    files: ["scripts/*.spec.ts"],
    preprocessors: {
      "scripts/*.spec.ts": ["webpack", "sourcemap"],
    },
    webpack: {
      resolve: {
        extensions: [".ts", ".tsx"],
        alias: {
          kaisa: path.resolve(__dirname, "../src/index.ts"),
        },
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/],
            use: ["babel-loader", "ts-loader"],
          },
        ],
      },
    },
    plugins: [
      "karma-webpack",
      "karma-jasmine",
      "karma-mocha-reporter",
      "karma-sourcemap-loader",
      "karma-chrome-launcher",
    ],
  });
};
