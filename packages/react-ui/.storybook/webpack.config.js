module.exports = async ({ config }) => {
  /**
   * Adding this rule gets rid of the annoying "Can't import the named export XXXX from
   * non EcmaScript module (only default export is available)" error.
   */
  config.module.rules = [
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    },
    ...config.module.rules,
  ]
  return config
}
