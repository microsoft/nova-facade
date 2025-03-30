import type { Preview } from "@storybook/react";
import { withErrorBoundary } from "../src/testing-utils/deorators";
const preview: Preview = {
  decorators: [withErrorBoundary],
};

export default preview;
