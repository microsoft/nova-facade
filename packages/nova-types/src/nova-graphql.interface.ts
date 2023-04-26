/**
 * Describes the GraphQL contract a Nova component can expect to be provided by the host application. Refer to the equally
 * named React hooks provided by the `@nova/react-facade` package for their functional details.
 *
 * The type used to annotate a GraphQL document is left opaque. It is up to the host to know what type this is at
 * runtime and to treat it accordingly. Refer to the `graphql` function provided by the `@nova/react-facade` package
 * for more details.
 *
 * In case the host application uses Apollo Client, these hooks can be provided by using the
 * `@graphitation/apollo-react-relay-duct-tape` package. See https://github.com/microsoft/graphitation for details.
 */

export interface NovaGraphQL<GraphQLDocument = any> {
  useFragment?: (
    fragmentInput: GraphQLDocument,
    fragmentRef: unknown,
  ) => unknown;

  useLazyLoadQuery?: (
    query: GraphQLDocument,
    variables: { [name: string]: unknown },
    options?: Record<string, unknown>,
  ) => { error?: Error; data?: unknown };

  useSubscription?: (config: {
    subscription: GraphQLDocument;
    variables: { [name: string]: unknown };
    context?: { [name: string]: unknown };
    onNext?: (response: unknown) => void;
    onError?: (error: Error) => void;
  }) => void;

  useMutation?: (
    mutation: GraphQLDocument,
  ) => [
    (options: {
      variables: { [name: string]: unknown };
      context?: { [name: string]: unknown };
      optimisticResponse?: unknown | null;
    }) => Promise<{ errors?: readonly Error[]; data?: unknown }>,
    boolean,
  ];
}
