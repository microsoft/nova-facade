import type { NovaGraphQL } from "@nova/types";
import {
  useFragment,
  useLazyLoadQuery,
  usePaginationFragment,
  useRefetchableFragment,
  useMutation as useRelayMutation,
  useSubscription,
  type Variables,
} from "react-relay/hooks";
import type { ConcreteRequest } from "relay-runtime";

const useMutation: NovaGraphQL<ConcreteRequest>["useMutation"] = (document) => {
  const [mutationFn, areMutationsInFlight] = useRelayMutation(document);

  return [
    ({
      variables,
      optimisticResponse,
      context: _context,
    }: {
      variables: { [name: string]: unknown };
      context?: { [name: string]: unknown };
      optimisticResponse?: unknown | null;
    }) => {
      // TODO(mapol): Figure out why these types don't match up with @nova/react
      // https://msfast.visualstudio.com/FAST%20Experiences/_workitems/edit/634001
      const relayCompatibleOptimisticResponse =
        typeof optimisticResponse === "object"
          ? optimisticResponse ?? undefined
          : undefined;

      return new Promise((resolve) => {
        mutationFn({
          variables,
          optimisticResponse: relayCompatibleOptimisticResponse,
          onCompleted: (data, errors) => {
            resolve({
              errors:
                errors?.map((error) => new Error(error.message)) ?? undefined,
              data,
            });
          },
          onError: (error) => {
            resolve({ errors: [error], data: undefined });
          },
        });
      });
    },
    areMutationsInFlight,
  ];
};

export const novaGraphql: Required<NovaGraphQL<ConcreteRequest>> = {
  useLazyLoadQuery: (
    document: ConcreteRequest,
    variables: Variables,
    options,
  ) => {
    // The relay version of useLazyLoadQuery returns the data directly or suspends.
    // TODO(mapol): We should perhaps figure out a way for Nova components to follow the api that does return an error.
    // Sync with Nova folks to figure out what the long term plan of this API is.
    // https://msfast.visualstudio.com/FAST%20Experiences/_workitems/edit/634006
    return {
      data: useLazyLoadQuery(document, variables, options),
      error: undefined,
    };
  },
  useFragment,
  usePaginationFragment,
  useRefetchableFragment,
  useSubscription,
  useMutation,
};
