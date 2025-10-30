import config from '@ticketer/eslint-config';
import tseslint from '@ticketer/eslint-config/tseslint.mjs';
import next from '@next/eslint-plugin-next';
import { defineConfig } from 'eslint/config';

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
		files: ['src/**/*.{ts,tsx}'],
		rules: {
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
