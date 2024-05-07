const rspack = require("@rspack/core");

const path = require('path');
module.exports = {
    entry: path.resolve(__dirname, 'src/index.ts'),
    output: {
        filename: 'index_bundle.ts',
        path: path.resolve(__dirname, '../../dist/@tsx/parser'),
        library: "$",
        libraryTarget: 'umd'
    },
    resolve: {
		extensions: ["...", ".ts", ".jsx",".css"],
        tsConfig: {
			configFile: path.resolve(__dirname, './tsconfig.json'),
			references: 'auto'
		}
    },
    module: {
		rules: [
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
		]
	},
    mode: 'development',
}