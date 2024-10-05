import * as path from "path";

export default {
  preset: "ts-jest",
  rootDir: process.cwd(),
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["node_modules", "__generated__"],
  testEnvironment: "jsdom",
  setupFiles: [path.join(__dirname, "jest.setup.ts")],
};
