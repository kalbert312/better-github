const webpack = require("webpack");
const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const copyWebpackPlugins = [
	{ from: "./src/icons" },
	{ from: "./src/options/options.html" },
];

module.exports = {
	entry: {
		main: path.join(__dirname, "src", "js", "index.jsx"),
		options: path.join(__dirname, "src", "options", "index.jsx"),
		background: path.join(__dirname, "src", "js", "background", "index.js"),
	},
	output: {
		path: path.join(__dirname, "build"),
		filename: "[name].js"
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: "babel-loader"
			},
			{
				test: /\.css$/,
				loader: "style-loader!css-loader"
			},
			{
				test: /\.(eot|png|svg|[ot]tf|woff2?)(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "fonts/",
						},
					},
				],
			},
		]
	},
	resolve: {
		extensions: [".js", ".jsx", ".css"],
		symlinks: false,
		modules: [path.resolve("node_modules")]
	},
	plugins: [
		// expose and write the allowed env vars on the compiled bundle
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
		}),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new CopyWebpackPlugin(copyWebpackPlugins),
		new WriteFilePlugin({
			log: false
		})
	]
};
