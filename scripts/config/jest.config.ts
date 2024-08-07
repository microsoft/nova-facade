import path from "path";

export default {
  preset: "ts-jest",
  rootDir: process.cwd(),
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["node_modules", "__generated__"],
  testEnvironment: "jsdom",
  transform: {
    "\\.(gql|graphql)$": "@graphql-tools/jest-transform",
  },
  setupFiles: [path.join(__dirname, "jest.setup.ts")],
  setupFilesAfterEnv: [path.join(__dirname, "jest.setupAfterEnv.ts")],
};
