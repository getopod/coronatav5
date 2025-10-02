module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/test/**/*.test.ts'],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
