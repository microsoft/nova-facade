import React from "react";
import type { NovaScheduling } from "@nova/types";
import invariant from "invariant";

// Initializing default with null to make sure providers are correctly placed in the tree
const NovaCommandingContext = React.createContext<NovaScheduling | null>(null);

interface NovaSchedulingProviderProps {
  scheduling: NovaScheduling;
}

export const NovaSchedulingProvider: React.FunctionComponent<
  NovaSchedulingProviderProps
> = ({ children, scheduling }) => {
  return (
    <NovaCommandingContext.Provider value={scheduling}>
      {children}
    </NovaCommandingContext.Provider>
  );
};
NovaSchedulingProvider.displayName = "NovaSchedulingProvider";

export const useNovaScheduling = (): NovaScheduling => {
  const commanding = React.useContext<NovaScheduling | null>(
    NovaCommandingContext,
  );
  invariant(
    commanding,
    "Nova Scheduling provider must be initialized prior to consumption!",
  );
  return commanding;
};
