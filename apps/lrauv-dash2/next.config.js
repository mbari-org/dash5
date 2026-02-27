// This is a workaround for Next.js 15 to handle TypeScript files in workspace packages
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  // Fix for Next.js 15 image optimization with static export
  images: {
    unoptimized: true,
  },

  // Next.js 13+ uses transpilePackages
  transpilePackages: ['@mbari/react-ui', '@mbari/utils', '@mbari/api-client'],
}

module.exports = nextConfig
