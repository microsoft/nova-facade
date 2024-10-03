import * as React from "react";
import {
  type NovaMockEnvironment as GenericNovaMockEnvironment,
  NovaMockEnvironmentProvider as GenericNovaMockEnvironmentProvider,
  type NovaMockEnvironmentProviderProps,
} from "../shared/nova-mock-environment";
import type { NovaGraphQL } from "@nova/types";
import type { MockFunctions } from "@graphitation/apollo-mock-client";
import type { TestingEnvironmentVariant } from "../shared/shared-utils";
import type { GraphQLTaggedNode } from "@nova/react";

type ApolloNovaGraphQL = NovaGraphQL & {
  mock: MockFunctions<unknown, GraphQLTaggedNode>;
};

export type NovaMockEnvironment<T extends TestingEnvironmentVariant = "test"> =
  GenericNovaMockEnvironment<T, ApolloNovaGraphQL> & { type: "apollo" };

export const NovaMockEnvironmentProvider = <T extends TestingEnvironmentVariant = "test">({
  children,
  environment,
}: React.PropsWithChildren<
  NovaMockEnvironmentProviderProps<T, ApolloNovaGraphQL>
>) => {
  return (
    <GenericNovaMockEnvironmentProvider environment={environment}>
      {children}
    </GenericNovaMockEnvironmentProvider>
  );
};
