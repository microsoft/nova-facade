module.exports = {
  preset: "ts-jest",
  rootDir: process.cwd(),
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["node_modules", "__generated__"],
  testEnvironment: "jsdom",
  transform: {
    "\\.(gql|graphql)$": "@graphql-tools/jest-transform",
  },
};
