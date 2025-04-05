import type { Decorator } from "@storybook/react";
import * as React from "react";
import { ErrorBoundary } from "../shared/ErrorBoundary";

export const withErrorBoundary: Decorator = (Story, context) => {
  const defaultProps: withErrorBoundaryParameters["errorBoundary"] = {
    fallback: <div>Error in story!</div>,
    onError: console.error,
  };

  const errorBoundaryProps = {
    ...defaultProps,
    ...context.parameters?.["errorBoundary"],
  };
  return (
    <ErrorBoundary {...errorBoundaryProps}>
      <Story />
    </ErrorBoundary>
  );
};

export type withErrorBoundaryParameters = {
  errorBoundary?: Omit<React.ComponentProps<typeof ErrorBoundary>, "children">;
};
