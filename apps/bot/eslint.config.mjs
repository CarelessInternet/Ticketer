import config from '@ticketer/eslint-config';
import tseslint from '@ticketer/eslint-config/tseslint.mjs';

export default tseslint.config(
	{
		extends: [...config, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/return-await': 'error',
			'no-return-await': 'off',
			'unicorn/no-anonymous-default-export': 'off',
		},
	},
	{
		ignores: ['src/i18n/i18n-*.ts', 'src/i18n/formatters.ts'],
	},
);
