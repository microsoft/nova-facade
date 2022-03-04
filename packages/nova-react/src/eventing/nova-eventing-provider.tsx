import * as React from "react";
import {
  NovaEvent,
  NovaEventing,
  EventWrapper
} from "@nova/types";
import { mapEventMetadata } from "./react-event-source-mapper";
import invariant from "invariant";

// Initializing default with null to make sure providers are correctly placed in the tree
const NovaEventingContext = React.createContext<NovaReactEventing | null>(null);

interface NovaEventingProviderProps {
  eventing: NovaEventing;
  reactEventMapper: (reactEventWrapper: ReactEventWrapper) => EventWrapper;
}

export interface ReactEventWrapper {
    event: NovaEvent<unknown>; // The event details for handling
    reactEvent: React.SyntheticEvent;
  }

export interface NovaReactEventing {
  bubble(event: ReactEventWrapper): Promise<void>;
}

export const NovaEventingProvider: React.FunctionComponent<NovaEventingProviderProps> = ({
  children,
  eventing,
  reactEventMapper,
}) => {
    
  // Stabilize the context value to prevent retriggering all consumers whenever this component rerenders
  const reactEventing: NovaReactEventing = React.useMemo(() => ({
    bubble: (eventWrapper: ReactEventWrapper) => {
      const mappedEvent = reactEventMapper
        ? reactEventMapper(eventWrapper)
        : mapEventMetadata(eventWrapper);
      return eventing.bubble(mappedEvent);
    },
  }), [eventing, reactEventMapper]);

  return (
    <NovaEventingContext.Provider value={reactEventing}>
      {children}
    </NovaEventingContext.Provider>
  );
};
NovaEventingProvider.displayName = "NovaEventingProvider";

export const useNovaEventing = (): NovaReactEventing => {
  const eventing = React.useContext<NovaReactEventing | null>(
    NovaEventingContext
  );
  invariant(
    eventing,
    "Nova Eventing provider must be initialized prior to consumption!"
  );
  return eventing;
};
