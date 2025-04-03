import type { MockResolvers } from "@nova/react-test-utils";
import type { TypeMap } from "../__generated__/schema.all.interface";

export const defaultNodeResolver: MockResolvers<TypeMap>["Node"] = (
  context,
) => {
  const id = context.args?.["id"] as string;

  if (id.startsWith("feedback:")) {
    return {
      __typename: "Feedback",
      id,
    };
  }
  return undefined;
};
