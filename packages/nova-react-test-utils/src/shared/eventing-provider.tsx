import { NovaEventingProvider, mapEventMetadata } from "@nova/react";
import type { EventWrapper, NovaEvent } from "@nova/types";
import * as React from "react";
import { defaultBubble } from "./shared-utils";

type EventCreatorMap = Record<string, (...args: any[]) => NovaEvent<unknown>>;
type EventMap<T extends EventCreatorMap> = {
  [Property in keyof T]?: (eventWrapper: {
    event: ReturnType<T[Property]>;
  }) => Promise<void>;
};

export const EventingProvider = <T extends EventCreatorMap>({
  eventMap,
  children,
}: {
  eventMap: EventMap<T>;
  children: React.ReactNode;
}) => {
  const bubble = (eventWrapper: EventWrapper): Promise<void> => {
    const eventType = eventWrapper.event.type as keyof T;
    const customEventHandler = eventMap[eventType];
    if (customEventHandler) {
      return customEventHandler(
        // As the key was in the map we now the type is correct
        eventWrapper as unknown as { event: ReturnType<T[keyof T]> },
      );
    } else {
      return defaultBubble(eventWrapper);
    }
  };
  return (
    <NovaEventingProvider
      eventing={{ bubble }}
      reactEventMapper={mapEventMetadata}
    >
      {children}
    </NovaEventingProvider>
  );
};
