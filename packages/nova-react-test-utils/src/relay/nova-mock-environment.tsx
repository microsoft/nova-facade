import * as React from "react";
import {
  type NovaMockEnvironment as GenericNovaMockEnvironment,
  NovaMockEnvironmentProvider as GenericNovaMockEnvironmentProvider,
  type NovaMockEnvironmentProviderProps,
} from "../shared/nova-mock-environment";
import type { NovaGraphQL } from "@nova/types";
import type { MockEnvironment } from "relay-test-utils";
import type { TestingEnvironmentVariant } from "../shared/shared-utils";

type RelayNovaGraphQL = NovaGraphQL & {
  mock: MockEnvironment["mock"];
};

export type NovaMockEnvironment<T extends TestingEnvironmentVariant = "test"> =
  GenericNovaMockEnvironment<T, RelayNovaGraphQL> & { type: "relay" };

export const NovaMockEnvironmentProvider = <T extends TestingEnvironmentVariant = "test">({
  children,
  environment,
}: React.PropsWithChildren<
  NovaMockEnvironmentProviderProps<T, RelayNovaGraphQL>
>) => {
  return (
    <GenericNovaMockEnvironmentProvider environment={environment}>
      {children}
    </GenericNovaMockEnvironmentProvider>
  );
};
