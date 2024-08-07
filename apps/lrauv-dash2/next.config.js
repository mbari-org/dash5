const withTM = require('next-transpile-modules')([
  '@mbari/react-ui',
  '@mbari/utils',
  '@mbari/api-client',
])

module.exports = withTM({
  basePath: '/dash5',
  reactStrictMode: true,
})
