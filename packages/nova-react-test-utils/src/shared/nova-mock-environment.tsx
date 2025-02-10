import * as React from "react";
import type { ComponentType, PropsWithChildren } from "react";
import type {
  NovaCentralizedCommanding,
  NovaGraphQL,
  NovaEventing,
  NovaLocalization,
} from "@nova/types";
import {
  mapEventMetadata,
  NovaCentralizedCommandingProvider,
  NovaEventingProvider,
  NovaGraphQLProvider,
  NovaLocalizationProvider,
} from "@nova/react";
import type {
  TestingEnvironmentVariant,
  GraphQLClientVariant,
} from "./shared-utils";

type Commanding<T extends TestingEnvironmentVariant> = T extends "test"
  ? jest.Mocked<NovaCentralizedCommanding>
  : NovaCentralizedCommanding;

type Eventing<T extends TestingEnvironmentVariant> = T extends "test"
  ? jest.Mocked<NovaEventing>
  : NovaEventing;

export interface NovaMockEnvironment<
  T extends TestingEnvironmentVariant = "test",
  E extends NovaGraphQL = NovaGraphQL,
> {
  commanding: Commanding<T>;
  eventing: Eventing<T>;
  /**
   * A React component that will be used to wrap the NovaFacadeProvider children. This is used by the test-utils to
   * inject a ApolloProvider.
   */
  providerWrapper: ComponentType<PropsWithChildren>;
  graphql: E;
  type: GraphQLClientVariant;
  localization: NovaLocalization;
}

export interface NovaMockEnvironmentProviderProps<
  T extends TestingEnvironmentVariant,
  E extends NovaGraphQL,
> {
  environment: NovaMockEnvironment<T, E>;
}

export const NovaMockEnvironmentProvider = <
  T extends TestingEnvironmentVariant = "test",
  E extends NovaGraphQL = NovaGraphQL,
>({
  children,
  environment,
}: React.PropsWithChildren<NovaMockEnvironmentProviderProps<T, E>>) => {
  return (
    <NovaEventingProvider
      eventing={environment.eventing}
      reactEventMapper={mapEventMetadata}
    >
      <NovaCentralizedCommandingProvider commanding={environment.commanding}>
        <NovaGraphQLProvider graphql={environment.graphql}>
          <NovaLocalizationProvider localization={environment.localization}>
            {React.createElement(
              environment.providerWrapper,
              undefined,
              children,
            )}
          </NovaLocalizationProvider>
        </NovaGraphQLProvider>
      </NovaCentralizedCommandingProvider>
    </NovaEventingProvider>
  );
};
NovaMockEnvironmentProvider.displayName = "NovaMockEnvironmentProvider";
