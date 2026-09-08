import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import { plugins } from "../vitest.plugins.ts";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {
      strictMode: true,
    },
  },
  viteFinal: (config) => {
    return mergeConfig(config, {
      plugins: [...plugins],
      optimizeDeps: {
        include: ["relay-runtime/experimental"],
      },
    });
  },
};
export default config;
