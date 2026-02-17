// This is a root level babel configuration to ensure consistent babel setup
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [['@babel/plugin-transform-runtime', { regenerator: true }]],
  // This ensures we use the same babel configuration for all packages
  babelrcRoots: ['.', './packages/*', './apps/*'],
}
