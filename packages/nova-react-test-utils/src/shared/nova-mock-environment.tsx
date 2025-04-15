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
import type { GraphQLClientVariant } from "./shared-utils";

export interface NovaMockEnvironment<E extends NovaGraphQL = NovaGraphQL> {
  commanding: NovaCentralizedCommanding;
  eventing: NovaEventing;
  /**
   * A React component that will be used to wrap the NovaFacadeProvider children. This is used by the test-utils to
   * inject a ApolloProvider.
   */
  providerWrapper: ComponentType<PropsWithChildren>;
  graphql: E;
  type: GraphQLClientVariant;
  localization: NovaLocalization;
}

export interface NovaMockEnvironmentProviderProps<E extends NovaGraphQL> {
  environment: NovaMockEnvironment<E>;
}

export const NovaMockEnvironmentProvider = <
  E extends NovaGraphQL = NovaGraphQL,
>({
  children,
  environment,
}: React.PropsWithChildren<NovaMockEnvironmentProviderProps<E>>) => {
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
