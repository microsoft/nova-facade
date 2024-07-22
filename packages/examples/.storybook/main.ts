import type { StorybookConfig } from "@storybook/react-webpack5";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  webpackFinal: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          "relay-runtime/lib/store/experimental-live-resolvers/LiveResolverStore":
            path.resolve(
              __dirname,
              "../../nova-react-test-utils/src/relay-runtime-live-types.d.ts",
            ),
        },
      },
      module: {
        ...config.module,
        rules: [
          ...(config?.module?.rules ?? []),
          {
            test: /\.(tsx|ts)$/,
            use: [
              {
                loader: require.resolve("esbuild-loader"),
                options: {
                  loader: "tsx",
                  target: "es2020",
                },
              },
            ],
            exclude: /node_modules/,
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
