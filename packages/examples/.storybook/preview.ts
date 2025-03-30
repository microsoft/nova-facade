import type { Preview } from "@storybook/react";
import { configure } from "@storybook/test";

configure({
  asyncUtilTimeout: 2000,
});

import { withErrorBoundary } from "../src/testing-utils/deorators";
const preview: Preview = {
  decorators: [withErrorBoundary],
  parameters: {
    test: {
      dangerouslyIgnoreUnhandledErrors: true,
    },
  },
};

export default preview;
