import * as React from "react";
import type { NovaGraphQL } from "@nova/types";
import * as invariant from "invariant";

// Initializing default with null to make sure providers are correctly placed in the tree
const NovaGraphQLContext = React.createContext<NovaGraphQL | null>(null);

interface NovaGraphQLProviderProps {
  graphql: NovaGraphQL;
  children?: React.ReactNode | undefined;
}

export const NovaGraphQLProvider: React.FunctionComponent<NovaGraphQLProviderProps> =
  ({ children, graphql }) => {
    return (
      <NovaGraphQLContext.Provider value={graphql}>
        {children}
      </NovaGraphQLContext.Provider>
    );
  };
NovaGraphQLProvider.displayName = "NovaGraphQLProvider";

export const useNovaGraphQL = (): NovaGraphQL => {
  const graphql = React.useContext<NovaGraphQL | null>(NovaGraphQLContext);
  invariant(
    graphql !== null,
    "Nova GraphQL provider must be initialized prior to consumption!",
  );
  return graphql;
};
