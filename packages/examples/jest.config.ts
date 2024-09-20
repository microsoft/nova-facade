import config from "../../scripts/config/jest.config";

export default {
  ...config,
  transform: {
    "\\.(gql|graphql)$": "@graphql-tools/jest-transform",
    // Needed to load relay compiler generated artifacts.
    ".+[\\\\/]relay[\\\\/].+\\.tsx?$":
      "@graphitation/embedded-document-artefact-loader/ts-jest",
    "^.+\\.tsx?$": ["ts-jest"],
  },
};
