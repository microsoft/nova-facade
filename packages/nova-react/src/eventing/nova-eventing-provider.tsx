import * as React from "react";
import type { NovaEvent, NovaEventing, EventWrapper } from "@nova/types";
import { InputType } from "@nova/types";
import invariant from "invariant";

// Context is initialized with an empty object and this is null-checked within the hooks
const NovaEventingContext = React.createContext<INovaEventingContext>({});

// All properties are optional in the context for initialization state only, but eventing must be supplied in the props
interface INovaEventingContext {
  eventing?: NovaReactEventing;
  unmountEventing?: NovaReactEventing;
  internal?: InternalEventingContext;
}

interface NovaEventingProviderProps {
  eventing: NovaEventing;
  /**
   * Optional version of eventing to use when unmounting, defaults to eventing if not supplied via props
   */
  unmountEventing?: NovaEventing;
  /**
   * Mapping logic to transform a React SyntheticEvent into a Nova
   * Source object. Supply the Nova default implemenation using the import
   * "mapEventMetadata".
   * */
  reactEventMapper: (reactEventWrapper: ReactEventWrapper) => EventWrapper;
  children?: React.ReactNode | undefined;
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

export interface InternalEventingContext {
  eventingRef: React.MutableRefObject<NovaEventing>;
  unmountEventingRef: React.MutableRefObject<NovaEventing>;
  mapperRef: React.MutableRefObject<
    (reactEventWrapper: ReactEventWrapper) => EventWrapper
  >;
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

  const reactEventing: NovaReactEventing = React.useMemo(
    () => ({
      bubble: async (eventWrapper: ReactEventWrapper) => {
        const mappedEvent: EventWrapper = mapperRef.current(eventWrapper);
        return getBubble(eventingRef, mappedEvent);
      },
      generateEvent: getGenerateEvent(eventingRef),
    }),
    [],
  );

  const reactUnmountEventing: NovaReactEventing = React.useMemo(
    () => ({
      bubble: async (eventWrapper: ReactEventWrapper) => {
        const mappedEvent: EventWrapper = mapperRef.current(eventWrapper);
        return getBubble(unmountEventingRef, mappedEvent);
      },
      generateEvent: getGenerateEvent(unmountEventingRef),
    }),
    [],
  );

  const contextValue = React.useMemo(
    () => ({
      eventing: reactEventing,
      unmountEventing: reactUnmountEventing,
      internal: { eventingRef, unmountEventingRef, mapperRef },
    }),
    [reactEventing, reactUnmountEventing],
  );

  return (
    <NovaEventingContext.Provider value={contextValue}>
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

interface NovaEventingInterceptorProps {
  interceptor: (event: EventWrapper) => Promise<EventWrapper | undefined>;
  children?: React.ReactNode | undefined;
}

export const NovaEventingInterceptor: React.FunctionComponent<
  NovaEventingInterceptorProps
> = ({ children, interceptor }) => {
  // Nova contexts provide a facade over framework functions
  // We don't need to trigger rerender in children when we are rerendered
  // or when the input functions change, we just need to make sure callbacks
  // use the right functions
  const interceptorRef = React.useRef(interceptor);
  if (interceptorRef.current !== interceptor) {
    interceptorRef.current = interceptor;
  }

  const { internal: rootInternal } = React.useContext(NovaEventingContext);

  if (!rootInternal) {
    invariant(
      rootInternal,
      "Nova Eventing provider must be initialized prior to creating NovaEventingInterceptor!",
    );
  }

  const reactEventing: NovaReactEventing = React.useMemo(
    () => ({
      bubble: async (eventWrapper: ReactEventWrapper) => {
        const mappedEvent: EventWrapper =
          rootInternal.mapperRef.current(eventWrapper);
        return getBubble(rootInternal.eventingRef, mappedEvent, interceptorRef);
      },
      generateEvent: getGenerateEvent(rootInternal.eventingRef, interceptorRef),
    }),
    [],
  );

  const reactUnmountEventing: NovaReactEventing = React.useMemo(
    () => ({
      bubble: async (eventWrapper: ReactEventWrapper) => {
        const mappedEvent: EventWrapper =
          rootInternal.mapperRef.current(eventWrapper);
        return getBubble(
          rootInternal.unmountEventingRef,
          mappedEvent,
          interceptorRef,
        );
      },
      generateEvent: getGenerateEvent(
        rootInternal.unmountEventingRef,
        interceptorRef,
      ),
    }),
    [],
  );

  // Internal should point to eventing/unmountEventing created by the interceptor
  const internal: InternalEventingContext = React.useMemo(
    () =>
      createInternalEventingContextPointingToInterceptor(
        rootInternal,
        interceptorRef,
      ),
    [interceptorRef],
  );

  const contextValue = React.useMemo(
    () => ({
      eventing: reactEventing,
      unmountEventing: reactUnmountEventing,
      internal,
    }),
    [reactEventing, reactUnmountEventing, internal],
  );

  return (
    <NovaEventingContext.Provider value={contextValue}>
      {children}
    </NovaEventingContext.Provider>
  );
};
NovaEventingInterceptor.displayName = "NovaEventingInterceptor";

const createInternalEventingContextPointingToInterceptor = (
  rootInternal: InternalEventingContext,
  interceptorRef: React.MutableRefObject<
    (event: EventWrapper) => Promise<EventWrapper | undefined>
  >,
): InternalEventingContext => {
  const eventing: NovaEventing = React.useMemo(
    () => ({
      bubble: async (eventWrapper: EventWrapper) =>
        getBubble(rootInternal.eventingRef, eventWrapper, interceptorRef),
    }),
    [],
  );

  const unmountEventing: NovaEventing = React.useMemo(
    () => ({
      bubble: async (eventWrapper: EventWrapper) =>
        getBubble(
          rootInternal.unmountEventingRef,
          eventWrapper,
          interceptorRef,
        ),
    }),
    [],
  );

  const eventingRef = React.useRef(eventing);
  const unmountEventingRef = React.useRef(unmountEventing);

  return {
    ...rootInternal,
    eventingRef,
    unmountEventingRef,
  };
};

/**
 * Used for eventing that should be triggered when the component is unmounted, such as within a useEffect cleanup function
 * If unmountEventing has not been supplied to the NovaEventingProvider, this will fallback to use the defualt eventing instance
 *
 * @returns NovaReactEventing
 */
export const useNovaUnmountEventing = (): NovaReactEventing => {
  const { unmountEventing } = React.useContext(NovaEventingContext);
  invariant(
    unmountEventing,
    "Nova Eventing provider must be initialized prior to consumption of unmountEventing!",
  );
  return unmountEventing;
};

const getBubble = async (
  eventingRef: React.MutableRefObject<NovaEventing>,
  eventWrapper: EventWrapper,
  interceptorRef?: React.MutableRefObject<
    (event: EventWrapper) => Promise<EventWrapper | undefined>
  >,
) => {
  if (!interceptorRef) {
    return eventingRef.current.bubble(eventWrapper);
  }

  let eventToBubble: EventWrapper | undefined = eventWrapper;
  eventToBubble = await interceptorRef.current(eventWrapper);

  return eventToBubble
    ? eventingRef.current.bubble(eventToBubble)
    : Promise.resolve();
};

const getGenerateEvent = (
  eventingRef: React.MutableRefObject<NovaEventing>,
  interceptorRef?: React.MutableRefObject<
    (event: EventWrapper) => Promise<EventWrapper | undefined>
  >,
) => {
  return async (eventWrapper: GeneratedEventWrapper) => {
    const mappedEvent = {
      event: eventWrapper.event,
      source: {
        inputType: InputType.programmatic,
        timeStamp: eventWrapper.timeStampOverride ?? Date.now(),
      },
    };
    if (!interceptorRef) {
      return eventingRef.current.bubble(mappedEvent);
    }

    let eventToBubble: EventWrapper | undefined = mappedEvent;
    eventToBubble = await interceptorRef.current(mappedEvent);

    return eventToBubble
      ? eventingRef.current.bubble(eventToBubble)
      : Promise.resolve();
  };
};
