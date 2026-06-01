// This is a workaround for Next.js 15 to handle TypeScript files in workspace packages
const { execSync } = require('child_process')

// Derive version from the most recent git tag (e.g. v5.1.37 → "5.1.37").
// Falls back to "dev" when git is unavailable (e.g. fresh Docker build without
// the .git directory).
let appVersion = 'dev'
try {
  const raw = execSync('git describe --tags --abbrev=0', {
    encoding: 'utf8',
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim()
  appVersion = raw.replace(/^v/, '')
} catch {
  // git unavailable or no tags yet
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
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
