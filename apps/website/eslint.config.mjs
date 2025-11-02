import config from '@ticketer/eslint-config';
import { defineConfig } from 'eslint/config';
import next from '@next/eslint-plugin-next';
import tseslint from '@ticketer/eslint-config/tseslint.mjs';

export default defineConfig(
	{
		plugins: { next },
	},
	{
		extends: [...config, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
		languageOptions: {
			globals: {
				React: true,
				JSX: true,
			},
			parserOptions: {
				projectService: true,
			},
		},
		files: ['src/**/*.{ts,tsx}', './eslint.config.mjs'],
		rules: {
			// TODO: remove this when https://github.com/eslint/eslint/issues/20272 is resolved.
			'@typescript-eslint/unified-signatures': 'off',
			// Consistently import navigation APIs from `@/i18n/routing`.
			'no-restricted-imports': [
				'error',
				{
					name: 'next/link',
					message: 'Please import from `@/i18n/routing` instead.',
				},
				{
					name: 'next/navigation',
					importNames: ['redirect', 'permanentRedirect', 'useRouter', 'usePathname'],
					message: 'Please import from `@/i18n/routing` instead.',
				},
			],
		},
	},
	{
		ignores: ['**/.next/', 'src/i18n/languages/en-GB.d.json.ts'],
	},
);
