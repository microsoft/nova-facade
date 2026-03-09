import type { EnvironmentMockResolversContext } from "@nova/react-test-utils";
import type { TypeMap } from "../../__generated__/schema.all.interface";

/**
 * @RelayResolver SuggestedFriend
 */
export function SuggestedFriend(
  id: string,
  _args: any,
  context: EnvironmentMockResolversContext<TypeMap>,
) {
  return context.mock.resolveById(id);
}

/**
 * @RelayResolver PersonName
 * @weak
 */
export type PersonName = { firstName: string; lastName: string };

/**
 * @RelayResolver SuggestedFriend.name: PersonName
 */
export function name(
  model: any,
  _args: any,
  context: EnvironmentMockResolversContext<TypeMap>,
): PersonName {
  const data = model.name;
  if (data === null) {
    return data;
  }

  // Return name object directly since PersonName doesn't have an ID
  return {
    firstName: data?.firstName ?? context.mock.resolve("String"),
    lastName: data?.lastName ?? context.mock.resolve("String"),
    ...data,
  };
}

/**
 * @RelayResolver PersonName.firstName: String
 */
export function firstName(
  model: PersonName,
  _args: any,
  context: EnvironmentMockResolversContext<TypeMap>,
): string {
  return model.firstName ?? context.mock.resolve("String");
}

/**
 * @RelayResolver PersonName.lastName: String
 */
export function lastName(
  model: PersonName,
  _args: any,
  context: EnvironmentMockResolversContext<TypeMap>,
): string {
  return model.lastName ?? context.mock.resolve("String");
}

/**
 * @RelayResolver Viewer.suggestedFriends: [SuggestedFriend!]
 */
export function suggestedFriends(
  _args: any,
  context: EnvironmentMockResolversContext<TypeMap>,
) {
  const resolverData = context.mock.resolve("Viewer")?.suggestedFriends ?? [];

  for (const item of resolverData) {
    context.mock.storeById(item.id, item);
  }

  return resolverData;
}
