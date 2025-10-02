export default {
  preset: 'ts-jest',
  testMatch: ['**/test/**/*.test.ts'],
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json'
    }
  }
};
