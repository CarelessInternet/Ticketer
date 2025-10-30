import { configs } from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import drizzle from 'eslint-plugin-drizzle';
import eslint from '@eslint/js';
import { fixupPluginRules } from '@eslint/compat';
import prettier from 'eslint-plugin-prettier/recommended';
import turbo from 'eslint-config-turbo/flat';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig(
	eslint.configs.recommended,
	...turbo,
	unicorn.configs['recommended'],
	prettier,
	...configs.strict,
	...configs.stylistic,
	{
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			drizzle: fixupPluginRules(drizzle),
		},
		ignores: ['node_modules/'],
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			'drizzle/enforce-delete-with-where': [
				'error',
				{
					drizzleObjectName: ['database'],
				},
			],
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
	},
);
