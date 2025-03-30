import type { Decorator } from "@storybook/react";
import * as React from "react";
import { ErrorBoundary } from "../shared/ErrorBoundary";

export const withErrorBoundary: Decorator = (Story, context) => {
  const defaultProps: withErrorBoundaryParameters["errorBoundary"] = {
    fallback: <div>Error!</div>,
    onError: console.error,
  };

  const errorBoundaryProps =
    context.parameters["errorBoundary"] ?? defaultProps;
  return (
    <ErrorBoundary {...errorBoundaryProps}>
      <Story />
    </ErrorBoundary>
  );
};

export type withErrorBoundaryParameters = {
  errorBoundary: Omit<React.ComponentProps<typeof ErrorBoundary>, "children">;
};
