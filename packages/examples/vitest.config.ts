import path from "node:path";
import { fileURLToPath } from "node:url";

import { coverageConfigDefaults, defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import { plugins } from "./vitest.plugins";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const browserConfig = {
  enabled: true,
  provider: "playwright",
  instances: [
    {
      browser: "chromium",
      headless: true,
    },
  ],
};

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineConfig({
  test: {
    workspace: [
      {
        plugins: [...plugins],
        test: {
          name: "component",
          browser: browserConfig,
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["vitest.component.setup.ts"],
        },
      },
      // Project for Storybook browser tests
      {
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook", // Name belongs inside the test config for the project
          browser: browserConfig,
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
