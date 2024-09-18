import config from "../../scripts/config/jest.config";

export default {
  ...config,
  transform: {
    "\\.(gql|graphql)$": "@graphql-tools/jest-transform",
    // Needed for packages/examples to load relay compiler generated artifacts.
    // It would be better if it could be config local to examples package but haven't found a way to configure it with just
    ".+[\\\\/]relay[\\\\/].+\\.tsx?$":
      "@graphitation/embedded-document-artefact-loader/ts-jest",
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // prevents error about graphql import not being used when artifacts are loaded
          noUnusedLocals: false,
        },
      },
    ],
  },
};
