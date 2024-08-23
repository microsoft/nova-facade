import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-webpack5",
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
