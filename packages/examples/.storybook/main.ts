import { dirname, join } from "path";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import { plugins } from "../vitest.plugins";
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-vitest"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {
      strictMode: true,
    },
  },
  viteFinal: (config) => {
    return mergeConfig(config, {
      plugins: [...plugins],
    });
  },
};
export default config;

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
