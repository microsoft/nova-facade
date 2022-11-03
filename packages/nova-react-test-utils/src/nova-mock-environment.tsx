import React from "react";
import type { ComponentType } from "react";
import {
  NovaCentralizedCommanding,
  NovaGraphQL,
  NovaEventing,
} from "@nova/types";
import { MockFunctions } from "@graphitation/apollo-mock-client";

import {
  GraphQLTaggedNode,
  mapEventMetadata,
  NovaCentralizedCommandingProvider,
  NovaEventingProvider,
  NovaGraphQLProvider,
} from "@nova/react";

export interface NovaMockEnvironment {
  commanding: jest.Mocked<NovaCentralizedCommanding>;
  eventing: jest.Mocked<NovaEventing>;
  graphql: NovaGraphQL & { mock: MockFunctions<unknown, GraphQLTaggedNode> };
  /**
   * A React component that will be used to wrap the NovaFacadeProvider children. This is used by the test-utils to
   * inject a ApolloProvider.
   */
  providerWrapper: ComponentType;
}

interface NovaMockEnvironmentProviderProps {
  environment: NovaMockEnvironment;
}

export const NovaMockEnvironmentProvider: React.FunctionComponent<NovaMockEnvironmentProviderProps> =
  ({ children, environment }) => {
    return (
      <NovaEventingProvider
        eventing={environment.eventing}
        reactEventMapper={mapEventMetadata}
      >
        <NovaCentralizedCommandingProvider commanding={environment.commanding}>
          <NovaGraphQLProvider graphql={environment.graphql}>
            {React.createElement(
              environment.providerWrapper,
              undefined,
              children,
            )}
          </NovaGraphQLProvider>
        </NovaCentralizedCommandingProvider>
      </NovaEventingProvider>
    );
  };
NovaMockEnvironmentProvider.displayName = "NovaMockEnvironmentProvider";
