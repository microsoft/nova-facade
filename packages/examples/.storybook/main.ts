import { dirname, join } from "path";
import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-webpack5-compiler-swc"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {
      strictMode: true,
    },
  },
  webpackFinal: (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...(config?.module?.rules ?? []),
          {
            test: /.+[\\/]relay[\\/].+\.tsx?$/,
            exclude: /node_modules/,
            loader: "@graphitation/embedded-document-artefact-loader/webpack",
          },
          {
            test: /\.(graphql)$/,
            loader: "@graphql-tools/webpack-loader",
          },
        ],
      },
    };
  },
};
export default config;

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
