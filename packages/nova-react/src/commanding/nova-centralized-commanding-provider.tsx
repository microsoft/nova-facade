import * as React from "react";
import type { NovaCentralizedCommanding } from "@nova/types";
import invariant from "invariant";

// Initializing default with null to make sure providers are correctly placed in the tree
const NovaCommandingContext =
  React.createContext<NovaCentralizedCommanding | null>(null);

interface NovaCentralizedCommandingProviderProps {
  commanding: NovaCentralizedCommanding;
  children?: React.ReactNode | undefined;
}

export const NovaCentralizedCommandingProvider: React.FunctionComponent<NovaCentralizedCommandingProviderProps> =
  ({ children, commanding }) => {
    return (
      <NovaCommandingContext.Provider value={commanding}>
        {children}
      </NovaCommandingContext.Provider>
    );
  };
NovaCentralizedCommandingProvider.displayName =
  "NovaCentralizedCommandingProvider";

export const useNovaCentralizedCommanding = (): NovaCentralizedCommanding => {
  const commanding = React.useContext<NovaCentralizedCommanding | null>(
    NovaCommandingContext,
  );
  invariant(
    commanding,
    "Nova Centralized Commanding provider must be initialized prior to consumption!",
  );
  return commanding;
};
