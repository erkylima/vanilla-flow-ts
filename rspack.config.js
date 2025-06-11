const rspack = require("@rspack/core");
/**
 * @type {import('@rspack/cli').Configuration}
 */
const path = require("path");

module.exports = {
	context: __dirname,
	entry: {
	  main: './src/main.ts',
	},
	mode:'development',
	devtool: "source-map",
	resolve: {
		extensions: ["...", ".ts", ".tsx", ".js",".css"]
	},
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
				emit: true,
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
			{
        		test: /\.(png|jpe?g|gif|svg)$/i,
				type: 'asset/resource', // ou 'asset/inline', 'asset', conforme necessidade
				generator: {
				filename: 'images/[hash][ext][query]', // pasta de saída
				},
			},
			{
				test: /\.ts$/,
				use: [
					{
						loader: 'builtin:swc-loader',
						/**
						 * @type {import('@rspack/core').SwcLoaderOptions}
						 */
						options: {
							jsc: {
								parser:{
									syntax: 'typescript'
								}
							}
						}
					}
				]
			}
	  	],
	},
	plugins: [
		new rspack.HtmlRspackPlugin({
			inject: true,
			template: "./public/index.html"
		})
	]
  };
  