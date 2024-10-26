import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixupPluginRules } from '@eslint/compat';
import drizzle from 'eslint-plugin-drizzle';
import eslint from '@eslint/js';
import tseslint from './tseslint.mjs';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-plugin-prettier/recommended';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

export default tseslint.config(
	eslint.configs.recommended,
	...compat.extends('turbo'),
	unicorn.configs['flat/recommended'],
	prettier,
	...tseslint.configs.strict,
	...tseslint.configs.stylistic,
	{
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
