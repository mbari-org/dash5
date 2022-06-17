module.exports = async ({ config }) => {
  /**
   * Adding this rule gets rid of the annoying "Can't import the named export XXXX from
   * non EcmaScript module (only default export is available)" error.
   */
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    },
    {
      test: /\.(js|jsx)$/,
      loader: require.resolve('babel-loader'),
      exclude: (filename) => {
        return /node_modules/.test(filename) && !/react-leaflet/.test(filename)
      },
      options: {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: [
          '@babel/plugin-proposal-nullish-coalescing-operator',
          '@babel/plugin-proposal-optional-chaining',
        ],
      },
    },
  ]
  return config
}
