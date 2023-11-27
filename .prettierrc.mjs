/** @type {import("prettier").Config} */
const config = {
	arrowParens: 'always',
	bracketSpacing: true,
	endOfLine: 'lf',
	htmlWhitespaceSensitivity: 'css',
	insertPragma: false,
	singleAttributePerLine: false,
	bracketSameLine: false,
	jsxSingleQuote: false,
	printWidth: 120,
	proseWrap: 'preserve',
	quoteProps: 'as-needed',
	requirePragma: false,
	semi: true,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: true,
	embeddedLanguageFormatting: 'auto',
	parser: 'typescript',
};

export default config;
