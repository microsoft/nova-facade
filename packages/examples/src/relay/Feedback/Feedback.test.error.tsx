import { expect, it, describe, vi } from "vitest";
import { composeStory } from "@storybook/react";
import * as stories from "./Feedback.stories";
import { render } from "vitest-browser-react";
import * as React from "react";

const mockOnError = vi.fn<(e: Error) => void>();

const Primary = composeStory(stories.Primary, {
  ...stories.default,
  parameters: {
    ...stories.default.parameters,
    errorBoundary: {
      onError: mockOnError,
    },
  },
});

describe("Feedback", () => {
  it("throws an error when artifact loader is not configured", async () => {
    render(<Primary />);
    await vi.waitFor(() => {
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });
    const call = mockOnError.mock.calls[0];
    expect(call[0].message).toBe(
      "Failed to load GraphQL artifact, got raw document instead. Make sure you have configured a loader (e.g., webpack loader, swc plugin) for working with compiled artifacts. Check https://github.com/microsoft/nova-facade/tree/main/packages/nova-react-test-utils#artifacts-loader, for more information.",
    );
  });
});
