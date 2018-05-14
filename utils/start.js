const webpack = require('webpack');
const config = require('../webpack.config');
require('./prepare');

webpack(
	Object.assign(config, {
		watch: true,
	}),
	(err, stats) => {
		if (err) {
			console.error(err);
			throw err;
		}
		console.log(stats.toString({
			chunks: true,
			colors: true,
		}));
	},
);
