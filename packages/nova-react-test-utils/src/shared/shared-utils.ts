import type {
  EntityCommand,
  EventWrapper,
  NovaLocalization,
} from "@nova/types";
import { action } from "@storybook/addon-actions";
import type { makeDecorator } from "@storybook/preview-api";

export type GraphQLClientVariant = "apollo" | "relay";

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

export const defaultLocalization: NovaLocalization = {
  useFormat() {
    return (key: unknown, placeholders: Record<string, string | number>) => {
      if (typeof key !== "string") {
        throw new Error(
          "The value passed to the format function returned by `useFormat` must be a string when using the test environment.",
        );
      }

      if (key.includes("plural,")) {
        console.warn(
          "Plural format is not (yet) supported in the test environment.",
        );

        return key;
      }

      return key
        .split("{")
        .map((part) => part.split("}"))
        .flat()
        .map((part) => {
          if (part in placeholders) {
            return placeholders[part];
          }
          return part;
        })
        .join("");
    };
  },
};

export type MakeDecoratorResult = ReturnType<typeof makeDecorator>;
