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
    //   '^node:fs$': 'fs',
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  };