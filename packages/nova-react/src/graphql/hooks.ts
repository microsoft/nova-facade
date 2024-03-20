import { useNovaGraphQL } from "./nova-graphql-provider";
import invariant from "invariant";

import type { GraphQLTaggedNode } from "./taggedNode";
import type {
  KeyType,
  KeyTypeData,
  OperationType,
  PaginationFn,
  RefetchFn,
} from "./types";

/**
 * Executes a GraphQL query.
 *
 * This hook is called 'lazy' as it is used to fetch a GraphQL query _during_ render. This hook can trigger multiple
 * round trips, one for loading and one for resolving.
 *
 * @see {useFragment} This function largely follows the documentation of `useFragment`, except that this is a root of a
 *                    GraphQL operation and thus does not take in any props such as opaque fragment references.
 *
 * @example
 ```typescript
 import { graphql, useLazyLoadQuery } from "@nova-facade/react";
 import { SomeReactComponent, fragment as SomeReactComponent_someGraphQLType } from "./SomeReactComponent";
 import { SomeRootReactComponentQuery } from "./__generated__/SomeRootReactComponentQuery.graphql";

 const query = graphql`
   query SomeRootReactComponentQuery {
     someGraphQLType {
       ...SomeReactComponent_someGraphQLType
     }
   }
   ${SomeReactComponent_someGraphQLType}
 `;

 export const SomeRootReactComponent: React.FC = () => {
   const result = useLazyLoadQuery<SomeRootReactComponentQuery>(query);
   if (result.error) {
     throw result.error;
   } else if (!result.data) {
     // Loading
     return null;
   }

   return (
     <SomeReactComponent someGraphQLType={result.data.someGraphQLType} />
   );
 };
 ```
 *
 * @param query The query operation to perform.
 * @param variables Object containing the variable values to fetch the query. These variables need to match GraphQL
 *                  variables declared inside the query.
 * @param options Options passed on to the underlying implementation.
 * @param options.context The query context to pass along the apollo link chain. Should be avoided when possible as
 *                        it will not be compatible with Relay APIs.
 * @returns An object with either an error, the result data, or neither while loading.
 */
export function useLazyLoadQuery<TQuery extends OperationType>(
  query: GraphQLTaggedNode,
  variables: TQuery["variables"],
  options?: { fetchPolicy?: "cache-first"; context?: TQuery["context"] },
): { error?: Error; data?: TQuery["response"] } {
  const graphql = useNovaGraphQL();
  invariant(
    graphql.useLazyLoadQuery,
    "Expected host to provide a useLazyLoadQuery hook",
  );
  return graphql.useLazyLoadQuery(query, variables, options);
}

/**
 * A first-class way for an individual component to express its direct data requirements using GraphQL. The fragment
 * should select all the fields that the component directly uses in its rendering or needs to pass to external
 * functions. It should *not* select data that its children need, unless those children are intended to remain their
 * pure React props as data inputs.
 *
 * For children that *do* have their own data requirements expressed using GraphQL, the fragment should ensure to
 * spread in the child's fragment.
 *
 * For each fragment defined using the `graphql` tagged template function, the Nova graphql-compiler will emit
 * TypeScript typings that correspond to the selected fields and referenced child component fragments. These typings
 * live in files in the sibling `./__generated__/` directory and are called after the fragment name. The compiler will
 * enforce some constraints about the fragment name, such that it starts with the name of the file it is defined in
 * (i.e. the name of the component) and ends with the name of the fragment reference prop that this component takes in
 * (which typically will be named after the GraphQL type that the fragment is defined on).
 *
 * The typing that has a `$key` suffix is meant to be used for the opaque fragment reference prop, whereas the typing
 * without a suffix describes the actual data and is only meant for usage internally to the file. When the opaque
 * fragment reference prop is passed to a `useFragment` call, the returned data will be unmasked and be typed according
 * to the typing without a suffix. As such, the unmasked typing is only ever needed when extracting pieces of the
 * component to the file scope. For functions extracted to different files, however, you should type those separately
 * and *not* use the emitted typings.
 *
 * @example
 ```typescript
 import { graphql, useFragment } from "@nova-facade/react";
 import { SomeChildReactComponent, fragment as SomeChildReactComponent_someGraphQLType } from "./SomeChildReactComponent";
 import { SomeReactComponent_someGraphQLType$key } from "./__generated__/SomeReactComponent_someGraphQLType.graphql";

 export const fragment = graphql`
   fragment SomeReactComponent_someGraphQLType on SomeGraphQLType {
     someDataThatThisComponentNeeds
     ...SomeChildReactComponent_someGraphQLType
   }
   ${SomeChildReactComponent_someGraphQLType}
 `;

 export interface SomeReactComponentProps {
   someGraphQLType: SomeReactComponent_someGraphQLType$key;
 }

 export const SomeReactComponent: React.FunctionComponent<SomeReactComponentProps> = props => {
   const someGraphQLType = useFragment(fragment, props.someGraphQLType);
   return (
     <div>
       <span>{someGraphQLType.someDataThatThisComponentNeeds}</span>
       <SomeChildReactComponent someGraphQLType={someGraphQLType} />
     </div>
   );
 }
 ```
 *
 * @todo For now, the fragment objects should be exported such that parent's can interpolate them into their own
 *       GraphQL documents. This may change in the future when/if we entirely switch to static compilation and will
 *       allow us to also move the usage of the graphql tagged template function inline at the `useFragment` call-site.
 *
 * @note If the host does not provide a `useFragment` implementation, the data is simply unmasked at compile-time but
 *       otherwise passed through from the parent at run-time.
 *
 * @param fragmentInput The GraphQL fragment document created using the `graphql` tagged template function.
 * @param fragmentRef The opaque fragment reference passed in by a parent component that has spread in this component's
 *                    fragment.
 * @returns The data corresponding to the field selections.
 */
export function useFragment(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: null | undefined,
): null | undefined;
export function useFragment<TKey extends KeyType>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): KeyTypeData<TKey>;
export function useFragment<TKey extends KeyType>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey | null | undefined,
): KeyTypeData<TKey> | null | undefined;

export function useFragment<TKey extends KeyType>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey | null | undefined,
): KeyTypeData<TKey> | null | undefined {
  return (
    useNovaGraphQL().useFragment?.(fragmentInput, fragmentRef) || fragmentRef
  );
}

/**
 * Equivalent to `useFragment`, but allows refetching of its subtree of the overall query.
 *
 * @see {@link https://microsoft.github.io/graphitation/docs/apollo-react-relay-duct-tape/use-refetchable-fragment}
 *
 * @param fragmentInput The GraphQL fragment document created using the `graphql` tagged template function.
 * @param fragmentRef The opaque fragment reference passed in by a parent component that has spread in this component's
 *                    fragment.
 * @returns The data corresponding to the field selections and a function to perform the refetch.
 */
export function useRefetchableFragment<
  TQuery extends OperationType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _TKey extends KeyType,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: null | undefined,
): [data: null | undefined, refetch: RefetchFn<TQuery["variables"]>];
export function useRefetchableFragment<
  TQuery extends OperationType,
  TKey extends KeyType,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): [data: KeyTypeData<TKey>, refetch: RefetchFn<TQuery["variables"]>];
export function useRefetchableFragment<
  TQuery extends OperationType,
  TKey extends KeyType,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey | null | undefined,
): [
  data: KeyTypeData<TKey> | null | undefined,
  refetch: RefetchFn<TQuery["variables"]>,
];

export function useRefetchableFragment<
  TQuery extends OperationType,
  TKey extends KeyType,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey | null | undefined,
): [
  data: KeyTypeData<TKey> | null | undefined,
  refetch: RefetchFn<TQuery["variables"]>,
] {
  const graphql = useNovaGraphQL();
  invariant(
    graphql.useRefetchableFragment,
    "Expected host to provide a useRefetchableFragment hook",
  );
  return graphql.useRefetchableFragment(fragmentInput, fragmentRef);
}

/**
 * Equivalent to `useFragment`, but allows pagination of its subtree of the overall query.
 *
 * @see {@link https://microsoft.github.io/graphitation/docs/apollo-react-relay-duct-tape/use-pagination-fragment}
 *
 * @param fragmentInput The GraphQL fragment document created using the `graphql` tagged template function.
 * @param fragmentRef The opaque fragment reference passed in by a parent component that has spread in this component's
 *                    fragment.
 * @returns The data corresponding to the field selections and functions to deal with pagination.
 */

export function usePaginationFragment<
  TQuery extends OperationType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TKey extends null | undefined,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: null | undefined,
): {
  data: null | undefined;
  loadNext: PaginationFn;
  loadPrevious: PaginationFn;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoadingNext: boolean;
  isLoadingPrevious: boolean;
  refetch: RefetchFn<TQuery["variables"]>;
};
export function usePaginationFragment<
  TQuery extends OperationType,
  TKey extends KeyType,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey,
): {
  data: KeyTypeData<TKey>;
  loadNext: PaginationFn;
  loadPrevious: PaginationFn;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoadingNext: boolean;
  isLoadingPrevious: boolean;
  refetch: RefetchFn<TQuery["variables"]>;
};
export function usePaginationFragment<
  TQuery extends OperationType,
  TKey extends KeyType,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey | null | undefined,
): {
  data: KeyTypeData<TKey> | null | undefined;
  loadNext: PaginationFn;
  loadPrevious: PaginationFn;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoadingNext: boolean;
  isLoadingPrevious: boolean;
  refetch: RefetchFn<TQuery["variables"]>;
};

export function usePaginationFragment<
  TQuery extends OperationType,
  TKey extends KeyType,
>(
  fragmentInput: GraphQLTaggedNode,
  fragmentRef: TKey | null | undefined,
): {
  data: KeyTypeData<TKey> | null | undefined;
  loadNext: PaginationFn;
  loadPrevious: PaginationFn;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoadingNext: boolean;
  isLoadingPrevious: boolean;
  refetch: RefetchFn<TQuery["variables"]>;
} {
  const graphql = useNovaGraphQL();
  invariant(
    graphql.usePaginationFragment,
    "Expected host to provide a usePaginationFragment hook",
  );
  return graphql.usePaginationFragment(fragmentInput, fragmentRef);
}

// https://github.com/facebook/relay/blob/master/website/docs/api-reference/types/GraphQLSubscriptionConfig.md
interface GraphQLSubscriptionConfig<
  TSubscriptionPayload extends OperationType,
> {
  subscription: GraphQLTaggedNode;
  variables: TSubscriptionPayload["variables"];
  /**
   * Should be avoided when possible as it will not be compatible with Relay APIs.
   */
  context?: TSubscriptionPayload["context"];
  /**
   * Should response be nullable?
   */
  onNext?: (response: TSubscriptionPayload["response"]) => void;
  onError?: (error: Error) => void;
}

export function useSubscription<TSubscriptionPayload extends OperationType>(
  config: GraphQLSubscriptionConfig<TSubscriptionPayload>,
): void {
  const graphql = useNovaGraphQL();
  invariant(
    graphql.useSubscription,
    "Expected host to provide a useSubscription hook",
  );
  graphql.useSubscription(config);
}

interface MutationCommitterOptions<TMutationPayload extends OperationType> {
  variables: TMutationPayload["variables"];
  /**
   * Should be avoided when possible as it will not be compatible with Relay APIs.
   */
  context?: TMutationPayload["context"];
  optimisticResponse?: Partial<TMutationPayload["response"]> | null;
}

type MutationCommitter<TMutationPayload extends OperationType> = (
  options: MutationCommitterOptions<TMutationPayload>,
) => Promise<{
  errors?: readonly Error[];
  data?: TMutationPayload["response"];
}>;

export function useMutation<TMutationPayload extends OperationType>(
  mutation: GraphQLTaggedNode,
): [MutationCommitter<TMutationPayload>, boolean] {
  const graphql = useNovaGraphQL();
  invariant(graphql.useMutation, "Expected host to provide a useMutation hook");
  return graphql.useMutation(mutation);
}
