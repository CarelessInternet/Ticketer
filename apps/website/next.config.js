const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		mdxRs: true,
	},
	pageExtensions: ['ts', 'tsx', 'mdx'],
};

module.exports = withMDX(nextConfig);
