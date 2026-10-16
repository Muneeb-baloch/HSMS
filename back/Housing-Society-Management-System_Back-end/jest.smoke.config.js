module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/test/smoke'],
  testMatch: ['**/*.smoke.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.smoke.json' }],
  },
  testTimeout: 30000,
  verbose: true,
  globalSetup: '<rootDir>/test/smoke/globalSetup.ts',
};
