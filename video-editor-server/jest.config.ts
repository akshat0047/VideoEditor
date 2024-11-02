export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest', // If you're using JSX as well
  },
  moduleNameMapper: {
    '^uuidv7$': require.resolve('uuidv7'), // Ensure to resolve the uuidv7 import correctly
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuidv7)', // Ensure uuidv7 is transformed
  ],
};