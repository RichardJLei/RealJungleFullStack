export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  extensionsToTreatAsEsm: [
    '.jsx',
    '.ts',
    '.tsx'
  ],
  setupFiles: ['<rootDir>/config/jest.setup.js'],
}; 