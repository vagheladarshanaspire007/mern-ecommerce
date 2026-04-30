import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,
  collectCoverageFrom: ['src/services/**/*.ts', '!src/services/**/__tests__/**'],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/utils/', '/src/config/', '/src/constants/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  maxWorkers: 1,
  testTimeout: 30000,
};

export default config;
