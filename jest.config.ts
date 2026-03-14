import nextJest from "next/jest.js";

import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/utils/**/*.ts",
    "src/lib/**/*.ts",
    "src/hooks/**/*.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "@config(.*)$": "<rootDir>/config/$1",
    "@env(.*)$": "<rootDir>/src/env.ts",
    // The @/ alias
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
