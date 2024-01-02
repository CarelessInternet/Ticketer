const { join } = require('node:path');

module.exports = {
	root: true,
	extends: [
		'@ticketer/eslint-config',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
	],
	parserOptions: {
		project: [join(__dirname, './tsconfig.json')],
	},
};
