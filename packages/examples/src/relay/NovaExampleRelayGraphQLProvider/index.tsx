import type { NovaGraphQL } from "@nova/types";
import type RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";

import * as React from "react";
import {
  useFragment,
  useRefetchableFragment,
  usePaginationFragment,
  useSubscription,
  RelayEnvironmentProvider,
} from "react-relay/hooks";
import { NovaGraphQLProvider } from "@nova/react";
import { useRelayLazyLoadQueryWithApolloAPI } from "./useRelayLazyLoadQueryWithApolloAPI";
import { useRelayMutationWithApolloAPI } from "./useRelayMutationWithApolloAPI";

const GraphQLInterface: NovaGraphQL = {
  useFragment,
  useRefetchableFragment,
  usePaginationFragment,
  useLazyLoadQuery: useRelayLazyLoadQueryWithApolloAPI,
  useMutation: useRelayMutationWithApolloAPI,
  useSubscription,
};

export const NovaExampleRelayGraphQLProvider: React.FC<
  React.PropsWithChildren<{ relayEnvironment: RelayModernEnvironment }>
> = ({ children, relayEnvironment }) => {
  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <NovaGraphQLProvider graphql={GraphQLInterface}>
        {children}
      </NovaGraphQLProvider>
    </RelayEnvironmentProvider>
  );
};
