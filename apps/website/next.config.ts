import createNextIntlPlugin from 'next-intl/plugin';

export default createNextIntlPlugin({
	experimental: { createMessagesDeclaration: './src/i18n/languages/en-GB.json' },
})({
	reactCompiler: true,
	typedRoutes: true,
	experimental: {
		turbopackFileSystemCacheForDev: true,
		viewTransition: true,
	},
	output: 'standalone',
});
