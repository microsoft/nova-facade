import { dirname, join } from "path";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import relayPlugin from "vite-plugin-relay";
import graphqlLoader from "vite-plugin-graphql-loader";
import commonjs from "vite-plugin-commonjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/experimental-addon-test"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {
      strictMode: true,
    },
  },
  viteFinal: (config) => {
    return mergeConfig(config, {
      plugins: [relayPlugin, graphqlLoader(), commonjs()],
    });
  },
};
export default config;

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
