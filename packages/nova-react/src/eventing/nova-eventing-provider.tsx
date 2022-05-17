import * as React from "react";
import { NovaEvent, NovaEventing, EventWrapper, InputType } from "@nova/types";
import invariant from "invariant";

// Initializing default with null to make sure providers are correctly placed in the tree
const NovaEventingContext = React.createContext<NovaReactEventing | null>(null);

interface NovaEventingProviderProps {
  eventing: NovaEventing;
  /**
   * Mapping logic to transform a React SyntheticEvent into a Nova
   * Source object. Supply the Nova default implemenation using the import
   * "mapEventMetadata".
   * */
  reactEventMapper: (reactEventWrapper: ReactEventWrapper) => EventWrapper;
}

export interface ReactEventWrapper {
  event: NovaEvent<unknown>;
  /**
   * React event generated from the user interaction
   */
  reactEvent: React.SyntheticEvent;
}

export interface GeneratedEventWrapper {
  event: NovaEvent<unknown>;
  /**
   * Optional timestamp in milliseconds since epoch format,
   * by default will use Date.now() if override not supplied.
   */
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
    // Nova contexts provide a facade over framework functions
    // We don't need to trigger rerender in children when we are rerendered
    // or when the input functions change, we just need to make sure callbacks
    // use the right functions
    const eventingRef = React.useRef(eventing);
    if (eventingRef.current !== eventing) {
      eventingRef.current = eventing;
    }

    const mapperRef = React.useRef(reactEventMapper);
    if (mapperRef.current !== reactEventMapper) {
      mapperRef.current = reactEventMapper;
    }

    const reactEventing: NovaReactEventing = React.useMemo(
      () => ({
        bubble: (eventWrapper: ReactEventWrapper) => {
          const mappedEvent: EventWrapper = mapperRef.current(eventWrapper);
          return eventingRef.current.bubble(mappedEvent);
        },
        generateEvent: (eventWrapper: GeneratedEventWrapper) => {
          const mappedEvent = {
            event: eventWrapper.event,
            source: {
              inputType: InputType.programmatic,
              timeStamp: eventWrapper.timeStampOverride ?? Date.now(),
            },
          };
          return eventingRef.current.bubble(mappedEvent);
        },
      }),
      [],
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
