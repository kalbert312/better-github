const webpack = require('webpack');
const config = require('../webpack.config');
require('./prepare');

webpack(
	Object.assign(config, {
		watch: true,
	}),
	err => {
		if (err) {
			throw err;
		}
	},
);
