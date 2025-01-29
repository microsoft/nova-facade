/**
 * NOTE: Taken from TMP packages/frameworks/frameworks-relay/src/react/hooks
 *
 * If needing to make changes, please make them in the upstream frameworks package.
 */

import { useQuery } from "relay-hooks";
import type {
  FetchPolicy,
  GraphQLTaggedNode,
  OperationType,
} from "relay-runtime";

/**
 * Hook that wraps useQuery hook from "relay-hooks" library and returns a Nova API compatible response.
 * We can't use original Relay useLazyLoadQuery, since its implementation is heavily relies on Suspense.
 */
export function useRelayLazyLoadQueryWithApolloAPI<
  TQuery extends OperationType,
>(
  query: GraphQLTaggedNode,
  variables: TQuery["variables"],
  options?: { fetchPolicy?: FetchPolicy },
): { error?: Error; data?: TQuery["response"] } {
  const result = useQuery(query, variables, options);
  return {
    ...result,
    error: result.error ?? undefined,
  };
}
