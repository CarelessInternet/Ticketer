module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'turbo',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/stylistic',
		'plugin:unicorn/recommended',
		'plugin:prettier/recommended',
	],
	plugins: ['@typescript-eslint', 'prettier'],
	settings: {
		react: {
			version: 'detect',
		},
	},
	ignorePatterns: ['node_modules/'],
	rules: {
		'prefer-rest-params': 'off',
		'prettier/prettier': 'error',
		'sort-imports': 'error',
		'unicorn/consistent-function-scoping': [
			'error',
			{
				checkArrowFunctions: false,
			},
		],
		'unicorn/filename-case': 'off',
	},
};
