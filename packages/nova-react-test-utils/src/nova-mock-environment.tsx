import React from "react";
import type { ComponentType } from "react";
import type {
  NovaCentralizedCommanding,
  NovaGraphQL,
  NovaEventing,
} from "@nova/types";
import type { MockFunctions } from "@graphitation/apollo-mock-client";

import type { GraphQLTaggedNode } from "@nova/react";
import {
  mapEventMetadata,
  NovaCentralizedCommandingProvider,
  NovaEventingProvider,
  NovaGraphQLProvider,
} from "@nova/react";

type Environment = "test" | "storybook";

type Commanding<T extends Environment> = T extends "test"
  ? jest.Mocked<NovaCentralizedCommanding>
  : NovaCentralizedCommanding;

type Eventing<T extends Environment> = T extends "test"
  ? jest.Mocked<NovaEventing>
  : NovaEventing;

export interface NovaMockEnvironment<T extends Environment = "test"> {
  commanding: Commanding<T>;
  eventing: Eventing<T>;
  graphql: NovaGraphQL & { mock: MockFunctions<unknown, GraphQLTaggedNode> };
  /**
   * A React component that will be used to wrap the NovaFacadeProvider children. This is used by the test-utils to
   * inject a ApolloProvider.
   */
  providerWrapper: ComponentType;
}

interface NovaMockEnvironmentProviderProps<T extends Environment> {
  environment: NovaMockEnvironment<T>;
}

export const NovaMockEnvironmentProvider = <T extends Environment = "test">({
  children,
  environment,
}: React.PropsWithChildren<NovaMockEnvironmentProviderProps<T>>) => {
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
