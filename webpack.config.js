const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	devtool: 'source-map',
	stats: 'errors-only',
	entry: {
		'background-script': './source/background-script',
		'options-ui-script': './source/options-ui-script',
		'browser-action-script': './source/browser-action-script',
		'content-script': './source/content-script'
	},
	output: {
		path: path.join(__dirname, 'distribution'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [path.resolve(__dirname, "source")],
				loader: 'babel-loader',
			},
			{
				test: /\.png$/i,
				loader: 'file-loader'
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(),

		// new HtmlWebpackPlugin({
		// 	title: 'AMBOSS Browser Addon Background',
		// 	filename: 'background-page.html',
		// 	template: 'source/tmp.html',
		// 	chunks: ['background-script'],
		// 	append: false
		// }),
		//
		// new HtmlWebpackPlugin({
		// 	title: 'AMBOSS Browser Addon Options Page',
		// 	filename: 'options-ui-page.html',
		// 	template: 'source/tmp.html',
		// 	chunks: ['options-ui-script'],
		// }),
		// new HtmlWebpackTagsPlugin({ files: ['options-ui-page.html'], tags: ['options-ui-styles.css'] }),
		//
		// new HtmlWebpackPlugin({
		// 	title: 'AMBOSS Browser Addon Browser Action Page',
		// 	filename: 'browser-action-page.html',
		// 	template: 'source/tmp.html',
		// 	chunks: ['browser-action-script'],
		// }),
		// new HtmlWebpackTagsPlugin({ files: ['browser-action-page.html'], tags: ['browser-action-styles.css'] }),

		new SizePlugin(),
		new CopyWebpackPlugin([
			{
				from: '**/*',
				context: 'source',
				ignore: ['*.js', 'media/*']
			},
			{
				from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
			}
		])
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					mangle: true,
					compress: true,
					extractComments: false,
					output: {
						comments: false,
						beautify: false,
						indent_level: 2
					}
				}
			})
		]
	}
};
