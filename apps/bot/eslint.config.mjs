import config from '@ticketer/eslint-config';
import { defineConfig } from 'eslint/config';
import tseslint from '@ticketer/eslint-config/tseslint.mjs';

export default defineConfig(
	{
		extends: [...config, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			'@typescript-eslint/return-await': 'error',
			// TODO: remove this when https://github.com/eslint/eslint/issues/20272 is resolved.
			'@typescript-eslint/unified-signatures': 'off',
			'no-return-await': 'off',
			'unicorn/no-anonymous-default-export': 'off',
		},
	},
	{
		ignores: ['src/i18n/i18n-*.ts', 'src/i18n/formatters.ts'],
	},
);
