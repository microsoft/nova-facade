import * as path from "path";
import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  rootDir: process.cwd(),
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["node_modules", "__generated__"],
  testEnvironment: "jsdom",
  setupFiles: [path.join(__dirname, "jest.setup.ts")],
  globals: {
    "ts-jest": {
      tsconfig: {
        esModuleInterop: true,
      },
    },
  },
};

export default config;
