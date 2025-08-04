import type { EnvironmentMockResolversContext } from "@nova/react-test-utils";

/**
 * @RelayResolver Feedback.displayLabel: String
 */
export function displayLabel(
  _args: any,
  context: EnvironmentMockResolversContext,
) {
  // Try to get mock data from context first
  const mockLabel = (context.mock.resolve("Feedback") as any)?.displayLabel;
  if (mockLabel !== undefined) {
    return mockLabel;
  }

  // Fall back to default resolver behavior
  const defaultLabel = context.mock.resolve("String");
  return defaultLabel ?? "Feedback";
}
