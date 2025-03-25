// This is a workaround for Next.js 15 to handle TypeScript files in workspace packages
const nextConfig = {
  // basePath: '/dash5',
  // assetPrefix: '.',
  // output: 'export',
  reactStrictMode: true,
  // Fix for Next.js 15 image optimization with static export
  images: {
    unoptimized: true,
  },

  // Next.js 13+ uses transpilePackages
  transpilePackages: ['@mbari/react-ui', '@mbari/utils', '@mbari/api-client'],

  // Make sure webpack can handle workspace TypeScript files
  webpack: (config, { isServer }) => {
    // Add TypeScript loader for workspace dependencies
    config.module.rules.push({
      test: /\.(tsx|ts)$/,
      include: [
        /node_modules\/@mbari\/react-ui/,
        /node_modules\/@mbari\/utils/,
        /node_modules\/@mbari\/api-client/,
        /packages\/react-ui/,
        /packages\/utils/,
        /packages\/api-client/,
      ],
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'],
          },
        },
      ],
    })

    return config
  },
}

module.exports = nextConfig
