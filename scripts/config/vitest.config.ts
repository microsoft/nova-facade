import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const setupFilePath = path.resolve(configDir, 'vitest.setup.ts');

export default defineConfig({
  test: {
    name: "component",
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
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: [setupFilePath],
  },
});
