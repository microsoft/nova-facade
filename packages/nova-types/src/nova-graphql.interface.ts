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

  useRefetchableFragment?: (
    fragmentInput: GraphQLDocument,
    fragmentRef: unknown,
  ) => [
    data: unknown,
    refetch: (
      variables: { [name: string]: unknown },
      options?: Record<string, unknown>,
    ) => { dispose: () => void },
  ];

  usePaginationFragment?: (
    fragmentInput: GraphQLDocument,
    fragmentRef: unknown,
  ) => {
    data: unknown;
    loadNext: (
      count: number,
      options?: Record<string, unknown>,
    ) => { dispose: () => void };
    loadPrevious: (
      count: number,
      options?: Record<string, unknown>,
    ) => { dispose: () => void };
    hasNext: boolean;
    hasPrevious: boolean;
    isLoadingNext: boolean;
    isLoadingPrevious: boolean;
    refetch: (
      variables: { [name: string]: unknown },
      options?: Record<string, unknown>,
    ) => { dispose: () => void };
  };

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

  useMutation?: <TMutationPayload extends OperationType>(
    mutation: GraphQLDocument,
  ) => [
    (options: {
      variables: { [name: string]: unknown };
      context?: { [name: string]: unknown };
      optimisticResponse?: unknown | null;
      onCompleted?: ((response: TMutationPayload["response"], errors: PayloadError[] | null) => void | null) | undefined;
      onError?: (error: Error) => void;
    }) => Disposable,
    boolean,
  ];

  useMutation_deprecated?: (
    mutation: GraphQLDocument,
  ) => [
    (options: {
      variables: { [name: string]: unknown };
      context?: { [name: string]: unknown };
      optimisticResponse?: Partial<any["response"]> | null;
      onCompleted?: (response: unknown) => void;
    }) => Promise<{ errors?: readonly Error[]; data?: unknown }>,
    boolean,
  ];
}

export type Disposable = {
  dispose(): void;
};

export interface OperationType {
  readonly variables: { [name: string]: any };
  readonly context?: { [name: string]: any };
  readonly response: any;
  readonly rawResponse?: unknown;
}

export interface PayloadError {
  message: string;
  locations?:
      | Array<{
          line: number;
          column: number;
      }>
      | undefined;
  path?: Array<string | number>;
  severity?: "CRITICAL" | "ERROR" | "WARNING" | undefined;
}
