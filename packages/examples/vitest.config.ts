import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  coverageConfigDefaults,
  defineConfig,
  mergeConfig,
} from "vitest/config";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import { plugins, pluginsWithoutRelay } from "./vitest.plugins";
import defaultConfig from "../../scripts/config/vitest.config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    workspace: [
      {
        plugins: [...plugins],
        test: mergeConfig(defaultConfig, {
          test: {
            setupFiles: [".storybook/vitest.setup.ts"],
          },
        })["test"],
      },
      {
        cacheDir: path.join(dirname, ".vitest2"),
        plugins: [...pluginsWithoutRelay],
        test: {
          name: "expectedErrors",
          include: ["src/**/*.test.error.{ts,tsx}"],
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
      {
        cacheDir: path.join(dirname, ".vitest"),
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "lib/**",
        "src/testing-utils/**",
        "**/.storybook/**",
        // 👇 This pattern must align with the `stories` property of your `.storybook/main.ts` config
        "**/*.stories.*",
        // 👇 This pattern must align with the output directory of `storybook build`
        "**/storybook-static/**",
        "vitest.*",
      ],
    },
  },
});
