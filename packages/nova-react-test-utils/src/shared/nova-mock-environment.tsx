import React from "react";
import type { ComponentType, PropsWithChildren } from "react";
import type {
  NovaCentralizedCommanding,
  NovaGraphQL,
  NovaEventing,
} from "@nova/types";
import type { MockFunctions as ApolloMockFunctions } from "@graphitation/apollo-mock-client";
import type { MockEnvironment } from "relay-test-utils";
import type { GraphQLTaggedNode } from "@nova/react";
import {
  mapEventMetadata,
  NovaCentralizedCommandingProvider,
  NovaEventingProvider,
  NovaGraphQLProvider,
} from "@nova/react";
import type { Variant } from "./shared-utils";
import type { jest } from "@jest/globals";

type RelayMockFunctions = MockEnvironment["mock"];
type Environment = "test" | "storybook";

type Commanding<T extends Environment> = T extends "test"
  ? jest.Mocked<NovaCentralizedCommanding>
  : NovaCentralizedCommanding;

type Eventing<T extends Environment> = T extends "test"
  ? jest.Mocked<NovaEventing>
  : NovaEventing;

export type NovaMockEnvironment<
  V extends Variant = "apollo",
  T extends Environment = "test",
> = {
  commanding: Commanding<T>;
  eventing: Eventing<T>;
  /**
   * A React component that will be used to wrap the NovaFacadeProvider children. This is used by the test-utils to
   * inject a ApolloProvider.
   */
  providerWrapper: ComponentType<PropsWithChildren>;
} & (V extends "apollo"
  ? {
      type: "apollo";
      graphql: NovaGraphQL & {
        mock: ApolloMockFunctions<unknown, GraphQLTaggedNode>;
      };
    }
  : {
      type: "relay";
      graphql: NovaGraphQL & { mock: RelayMockFunctions };
    });

interface NovaMockEnvironmentProviderProps<
  V extends Variant,
  T extends Environment,
> {
  environment: NovaMockEnvironment<V, T>;
}

export const NovaMockEnvironmentProvider = <
  V extends Variant = "apollo",
  T extends Environment = "test",
>({
  children,
  environment,
}: React.PropsWithChildren<NovaMockEnvironmentProviderProps<V, T>>) => {
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
