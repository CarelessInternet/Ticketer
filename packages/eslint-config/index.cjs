module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'turbo',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/stylistic',
		'plugin:drizzle/recommended',
		'plugin:unicorn/recommended',
		'plugin:prettier/recommended',
	],
	plugins: ['@typescript-eslint', 'drizzle', 'prettier'],
	settings: {
		react: {
			version: 'detect',
		},
	},
	ignorePatterns: ['node_modules/'],
	rules: {
		'@typescript-eslint/consistent-type-imports': 'error',
		'no-warning-comments': 'warn',
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
