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

  webpack: (config) => {
    // Watch monorepo packages for HMR so changes to packages/react-ui etc.
    // trigger hot reload without a full dev server restart.
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
    }
    return config
  },
}

module.exports = nextConfig
