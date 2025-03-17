module.exports = {
  basePath: '/dash5',
  reactStrictMode: true,
  transpilePackages: ['@mbari/react-ui', '@mbari/utils', '@mbari/api-client'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dash5',
        basePath: false,
        permanent: true,
        has: [
          {
            type: 'header',
            key: 'host',
            value: '^(localhost:3000|localhost:3001)$',
          },
        ],
      },
    ]
  },
}
