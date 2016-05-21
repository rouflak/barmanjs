var webpackConfig = require("./webpack.config.js");
var webpack = require("webpack");

webpackConfig.output.filename = "barman.min.js";

if (webpackConfig.plugins) {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
} else {
    webpackConfig.plugins = [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ];
}

module.exports = webpackConfig;
