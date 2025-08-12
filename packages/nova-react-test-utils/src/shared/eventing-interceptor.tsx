import { NovaEventingInterceptor } from "@nova/react";
import type {
  EventWrapper,
  NovaEvent,
  Source,
  EventInterceptor,
} from "@nova/types";
import * as React from "react";

type EventCreatorMap = Record<string, (...args: any[]) => NovaEvent<unknown>>;
type EventMap<T extends EventCreatorMap> = {
  [Property in keyof T]?: (eventWrapper: {
    event: ReturnType<T[Property]>;
    source: Source;
  }) => Promise<undefined | EventWrapper>;
};

export type EventingInterceptorProps<T extends EventCreatorMap> = React.PropsWithChildren<{
  eventMap: EventMap<T>;
}>;
export type EventingInterceptorFC<T extends EventCreatorMap> = React.FC<EventingInterceptorProps<T>>;

export const EventingInterceptor: EventingInterceptorFC<EventCreatorMap> = ({
  eventMap,
  children,
}) => {
  const interceptor: EventInterceptor = (eventWrapper) => {
    const eventType = eventWrapper.event.type;
    const customEventHandler = eventMap[eventType];
    if (customEventHandler) {
      return customEventHandler(
        eventWrapper,
      );
    } else {
      return Promise.resolve(eventWrapper);
    }
  };

  return (
    <NovaEventingInterceptor interceptor={interceptor}>
      {children}
    </NovaEventingInterceptor>
  );
};
