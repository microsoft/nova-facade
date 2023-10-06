import * as React from "react";
import type { NovaEvent, NovaEventing, EventWrapper } from "@nova/types";
import { InputType } from "@nova/types";
import invariant from "invariant";

// Initializing default with null to make sure providers are correctly placed in the tree
const NovaEventingContext = React.createContext<INovaEventingContext>({});

interface INovaEventingContext {
  eventing?: NovaReactEventing;
  unmountEventing?: NovaReactEventing;
}

interface NovaEventingProviderProps {
  eventing: NovaEventing;
  unmountEventing?: NovaEventing; // Optional version of eventing to use when unmounting, defaults to eventing if not supplied
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

export const NovaEventingProvider: React.FunctionComponent<
  NovaEventingProviderProps
> = ({ children, eventing, unmountEventing, reactEventMapper }) => {
  // Nova contexts provide a facade over framework functions
  // We don't need to trigger rerender in children when we are rerendered
  // or when the input functions change, we just need to make sure callbacks
  // use the right functions
  const eventingRef = React.useRef(eventing);
  if (eventingRef.current !== eventing) {
    eventingRef.current = eventing;
  }

  const unmountEventingRef = React.useRef(unmountEventing || eventing);
  if (unmountEventingRef.current !== unmountEventing) {
    unmountEventingRef.current = unmountEventing || eventing; // default to eventing if unmountEventing not supplied
  }

  const mapperRef = React.useRef(reactEventMapper);
  if (mapperRef.current !== reactEventMapper) {
    mapperRef.current = reactEventMapper;
  }

  const reactEventing = React.useMemo(
    generateEventing(eventingRef, mapperRef),
    [],
  );

  const reactUnmountEventing = React.useMemo(
    generateEventing(unmountEventingRef, mapperRef),
    [],
  );

  return (
    <NovaEventingContext.Provider
      value={{ eventing: reactEventing, unmountEventing: reactUnmountEventing }}
    >
      {children}
    </NovaEventingContext.Provider>
  );
};
NovaEventingProvider.displayName = "NovaEventingProvider";

export const useNovaEventing = (): NovaReactEventing => {
  const { eventing } = React.useContext(NovaEventingContext);
  invariant(
    eventing,
    "Nova Eventing provider must be initialized prior to consumption of eventing!",
  );
  return eventing;
};

export const useNovaUnmountEventing = (): NovaReactEventing => {
  const { unmountEventing } = React.useContext(NovaEventingContext);
  invariant(
    unmountEventing,
    "Nova Eventing provider must be initialized prior to consumption of unmountEventing!",
  );
  return unmountEventing;
};

const generateEventing =
  (
    eventingRef: React.MutableRefObject<NovaEventing>,
    mapperRef: React.MutableRefObject<
      (reactEventWrapper: ReactEventWrapper) => EventWrapper
    >,
  ) =>
  (): NovaReactEventing => ({
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
  });
