import * as React from "react";
import {
  type NovaMockEnvironment as GenericNovaMockEnvironment,
  NovaMockEnvironmentProvider as GenericNovaMockEnvironmentProvider,
  type NovaMockEnvironmentProviderProps,
} from "../shared/nova-mock-environment";
import type { NovaGraphQL } from "@nova/types";
import type { MockEnvironment } from "relay-test-utils";

type RelayNovaGraphQL = NovaGraphQL & {
  mock: MockEnvironment["mock"];
};

export type NovaMockEnvironment =
  GenericNovaMockEnvironment<RelayNovaGraphQL> & { type: "relay" };

export const NovaMockEnvironmentProvider = ({
  children,
  environment,
}: React.PropsWithChildren<
  NovaMockEnvironmentProviderProps<RelayNovaGraphQL>
>) => {
  return (
    <GenericNovaMockEnvironmentProvider environment={environment}>
      {children}
    </GenericNovaMockEnvironmentProvider>
  );
};
