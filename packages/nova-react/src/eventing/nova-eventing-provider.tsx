import * as React from "react";
import { NovaEvent, NovaEventing, EventWrapper, InputType } from "@nova/types";
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

export interface GeneratedEventWrapper {
  event: NovaEvent<unknown>; // The event details for handling
  timeStampOverride?: number;
}

export interface NovaReactEventing {
  /**
   * Bubble a user interaction event up to the host application.
   * @param event the React SyntheticEvent and the Nova Event metadata associated with it.
   */
  bubble(event: ReactEventWrapper): Promise<void>;
  /**
   * Generate a programmatic event to pass up the host application.
   * Use this if the event is not associated with a React SyntheticEvent.
   * @param event the NovaEvent to fire.
   */
  generateEvent(eventWrapper: GeneratedEventWrapper): Promise<void>;
}

export const NovaEventingProvider: React.FunctionComponent<NovaEventingProviderProps> =
  ({ children, eventing, reactEventMapper }) => {
    // Stabilize the context value to prevent retriggering all consumers whenever this component rerenders
    const reactEventing: NovaReactEventing = React.useMemo(
      () => ({
        bubble: (eventWrapper: ReactEventWrapper) => {
          const mappedEvent = reactEventMapper
            ? reactEventMapper(eventWrapper)
            : mapEventMetadata(eventWrapper);
          return eventing.bubble(mappedEvent);
        },
        generateEvent: (eventWrapper: GeneratedEventWrapper) => {
          const mappedEvent = {
            event: eventWrapper.event,
            source: {
              inputType: InputType.programmatic,
              timeStamp: eventWrapper.timeStampOverride ?? Date.now(),
            },
          };
          return eventing.bubble(mappedEvent);
        },
      }),
      [eventing, reactEventMapper],
    );

    return (
      <NovaEventingContext.Provider value={reactEventing}>
        {children}
      </NovaEventingContext.Provider>
    );
  };
NovaEventingProvider.displayName = "NovaEventingProvider";

export const useNovaEventing = (): NovaReactEventing => {
  const eventing = React.useContext<NovaReactEventing | null>(
    NovaEventingContext,
  );
  invariant(
    eventing,
    "Nova Eventing provider must be initialized prior to consumption!",
  );
  return eventing;
};
