import type { EntityCommand, EventWrapper } from "@nova/types";
import { action } from "@storybook/addon-actions";

export type Variant = "apollo" | "relay";

export function defaultBubble(eventWrapper: EventWrapper): Promise<void> {
  const eventData =
    typeof eventWrapper.event.data === "function"
      ? eventWrapper.event.data()
      : eventWrapper.event.data;
  action(`${eventWrapper.event.originator}.${eventWrapper.event.type}`)(
    eventData,
  );
  return Promise.resolve();
}

export function defaultTrigger(command: EntityCommand): Promise<void> {
  action("trigger")(command);
  return Promise.resolve();
}
