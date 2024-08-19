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
      optimisticResponse, // TODO: use provided on completed
    }) => {
      const relayCompatibleOptimisticResponse =
        typeof optimisticResponse === "object"
          ? optimisticResponse ?? undefined
          : undefined;

      return new Promise((resolve, reject) => {
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
            reject({ errors: [error], data: undefined });
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
