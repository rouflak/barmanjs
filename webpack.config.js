export default {
    entry: "./index.js",
    output: {
        path: __dirname,
        filename: "build.js"
    },
    devServer: {
        contentBase: __dirname
    }
}
