import config from "../../scripts/config/jest.config";

export default {
  ...config,
  transform: {
    "\\.(gql|graphql)$": "@graphql-tools/jest-transform",
    "^.+\\.tsx?$": "@graphitation/embedded-document-artefact-loader/ts-jest",
  },
};
