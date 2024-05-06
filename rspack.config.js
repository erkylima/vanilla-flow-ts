const rspack = require("@rspack/core");
/**
 * @type {import('@rspack/cli').Configuration}
 */

module.exports = {
	context: __dirname,
	entry: {
	  main: './src/main.ts',
	},
	mode:'development',
	resolve: {
		extensions: ["...", ".ts", ".jsx",".css"]
	},
	devtool: "source-map",
	devServer: {
		hot: false,
		
	},
	optimization: {
		minimize: true 
	},
	module: {
	  	generator: {
			'css/auto': {
				exportsConvention: 'as-is',
				exportsOnly: false,
				localIdentName: '[uniqueName]-[id]-[local]',
			},
			'asset/resource': {
				emit: false,
			},
	  	},
	  	rules: [
			{
		  	test: /\.css/,
		  	parser: {
				namedExports: false,
		  	},
		  	type: 'css/module',
			},
	  	],
	},
	plugins: [
		new rspack.HtmlRspackPlugin({
			inject: true,
			template: "./public/index.html"
		})
	]
  };
  