/**
 * NOTE: Taken from TMP packages/frameworks/frameworks-relay/src/react/hooks
 *
 * If needing to make changes, please make them in the upstream frameworks package.
 */

import { useMutation as useRelayMutation } from "react-relay/hooks";
import type { GraphQLTaggedNode, MutationParameters } from "relay-runtime";

type MutationCommitter<TMutation extends MutationParameters> = (options: {
  variables: { [name: string]: unknown };
  context?: { [name: string]: unknown };
  optimisticResponse?: unknown | null;
  onCompleted?: (response: unknown) => void;
}) => Promise<{ errors?: Error[]; data?: TMutation["response"] }>;

/**
 * Hook that wraps original Relay useMutation hook and returns mutation committer,
 * that returns a promise. This is required for alignment with Apollo client
 * useMutation hook API for smoother migration of production code to Relay.
 * @param mutation Mutation document.
 * @returns Array containing mutation committer function and a flag
 * indicating whether mutation is "in flight".
 */
export function useRelayMutationWithApolloAPI<
  TMutation extends MutationParameters,
>(mutation: GraphQLTaggedNode): [MutationCommitter<TMutation>, boolean] {
  const [commitMutation, isMutationInFlight] = useRelayMutation(mutation);
  return [
    (options) => {
      return new Promise((resolve, reject) => {
        commitMutation({
          variables: options.variables,
          onCompleted: (response, errors) => {
            resolve(
              errors
                ? {
                    data: response,
                    errors: errors.map((e) => new Error(e.message)),
                  }
                : { data: response },
            );
          },
          onError: (error) => {
            reject(error);
          },
        });
      });
    },
    isMutationInFlight,
  ];
}
