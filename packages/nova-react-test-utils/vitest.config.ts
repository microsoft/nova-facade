import { defineConfig } from "vitest/config";

// TODO: remove test variant from env and why is this triggering a browser instead of running in headless?
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
    setupFiles: ["./vitest.setup.ts"],
  },
});
