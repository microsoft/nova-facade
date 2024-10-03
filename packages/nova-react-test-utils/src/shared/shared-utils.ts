import type { EntityCommand, EventWrapper } from "@nova/types";
import { action } from "@storybook/addon-actions";
import type { makeDecorator } from "@storybook/preview-api";

export type GraphQLClientVariant = "apollo" | "relay";

export type TestingEnvironmentVariant = "test" | "storybook";

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

export type MakeDecoratorResult = ReturnType<typeof makeDecorator>;
