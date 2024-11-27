import React from "react";
import type { NovaScheduling } from "@nova/types";
import invariant from "invariant";

// Initializing default with null to make sure providers are correctly placed in the tree
const NovaSchedulingContext = React.createContext<NovaScheduling | null>(null);

interface NovaSchedulingProviderProps {
  scheduling: NovaScheduling;
}

export const NovaSchedulingProvider: React.FunctionComponent<
  NovaSchedulingProviderProps
> = ({ children, scheduling }) => {
  return (
    <NovaSchedulingContext.Provider value={scheduling}>
      {children}
    </NovaSchedulingContext.Provider>
  );
};
NovaSchedulingProvider.displayName = "NovaSchedulingProvider";

export const useNovaScheduling = (): NovaScheduling => {
  const scheduling = React.useContext<NovaScheduling | null>(
    NovaSchedulingContext,
  );
  invariant(
    scheduling,
    "Nova Scheduling provider must be initialized prior to consumption!",
  );
  return scheduling;
};
