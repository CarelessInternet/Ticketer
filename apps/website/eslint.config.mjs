import config from '@ticketer/eslint-config';
import tseslint from '@ticketer/eslint-config/tseslint.mjs';
import next from '@next/eslint-plugin-next';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

export default tseslint.config(
	...fixupConfigRules(compat.config(next.configs['core-web-vitals'])),
	{
		extends: [...config, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
		languageOptions: {
			globals: {
				React: true,
				JSX: true,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
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
		ignores: ['**/.next/'],
	},
);
