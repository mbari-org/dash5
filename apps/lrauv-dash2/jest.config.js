module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./jest/setup.js'],
  testMatch: ['**/jest/**/?(*.)+(test).[jt]s?(x)'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': '<rootDir>/jest/styleMock.js',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/jest/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}
