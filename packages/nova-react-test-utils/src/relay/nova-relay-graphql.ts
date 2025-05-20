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
    ({ variables, optimisticResponse, onCompleted }) => {
      const relayCompatibleOptimisticResponse =
        typeof optimisticResponse === "object"
          ? (optimisticResponse ?? undefined)
          : undefined;

      return new Promise((resolve, reject) => {
        mutationFn({
          variables,
          optimisticResponse: relayCompatibleOptimisticResponse,
          onCompleted: (data, errors) => {
            onCompleted?.(data);
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

const isGraphqlArtifact = (document: ConcreteRequest): boolean => {
  // This happens when artifact loader is not configured, then document is of type {graphql.DocumentNode}
  // and doesn't have params property
  return !!document.params;
};

export const novaGraphql: Required<NovaGraphQL<ConcreteRequest>> = {
  useLazyLoadQuery: (
    document: ConcreteRequest,
    variables: Variables,
    options,
  ) => {
    if (!isGraphqlArtifact(document)) {
      throw new Error(
        "Failed to load GraphQL artifact, got raw document instead. Make sure you have configured a loader (e.g., webpack loader, swc plugin) for working with compiled artifacts." +
          " Check https://github.com/microsoft/nova-facade/tree/main/packages/nova-react-test-utils#prerequisites, for more information.",
      );
    }
    if (isClientOnlyQuery(document)) {
      console.warn(`The ${document.params.name} query is a client-only query, which means mock resolvers won't get called. Please select at least one server field in the query to ensure that mock resolvers are called.`);
      console.warn(
          ` If you want to test any queries with client extension, please use relay based payload generator over default one, as the default still doesn't support client extension. ` +
          ` Check https://github.com/microsoft/nova-facade/tree/main/packages/nova-react-test-utils#pure-relay-or-nova-with-relay-how-can-i-make-sure-the-mock-data-is-generated-for-client-extensions ` +
          ` If you have a nested client extensions only query, make sure to have a query with server field on top of your story which selects same client extensions to fill the cache.`,
      );
    }
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

const isClientOnlyQuery = (document: ConcreteRequest) => {
  const queryText = document.params.text;

  const areAllSelectionsOnClientExtensions = document.fragment.selections.every(
    (selection) => selection.kind === "ClientExtension",
  );

  return queryText === null && areAllSelectionsOnClientExtensions;
};
