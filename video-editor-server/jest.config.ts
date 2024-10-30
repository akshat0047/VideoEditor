// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/tests/*.spec.ts', '**/tests/**/*.spec.ts', '**/src/**/*.spec.ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    moduleNameMapper: {
      '^node:(.+)$': '$1',
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    globals: {
      'ts-jest': {
          tsconfig: 'tsconfig.json', // Ensure it points to the correct tsconfig
      },
  },
  };