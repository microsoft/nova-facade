import type { EnvironmentMockResolversContext } from "@nova/react-test-utils";
import type { TypeMap } from "../../__generated__/schema.all.interface";

/**
 * @RelayResolver Feedback.displayLabel: String
 */
export function displayLabel(
  _args: any,
  context: EnvironmentMockResolversContext<TypeMap>,
) {
  // Try to get mock data from context first
  const mockLabel = context.mock.resolve("Feedback")?.displayLabel;
  if (mockLabel !== undefined) {
    return mockLabel;
  }

  // Fall back to default resolver behavior
  const defaultLabel = context.mock.resolve("String");
  return defaultLabel ?? "Feedback";
}
