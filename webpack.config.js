var webpack = require("webpack");
var path = require("path");

module.exports = {
    entry: "./src/barman.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "barman.js"
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    devServer: {
        contentBase: __dirname
    }
}
