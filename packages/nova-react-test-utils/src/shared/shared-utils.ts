import type {
  EntityCommand,
  EventWrapper,
  NovaLocalization,
} from "@nova/types";
import { getAction } from "./storybook-compat";

export type GraphQLClientVariant = "apollo" | "relay";

export async function defaultBubble(eventWrapper: EventWrapper): Promise<void> {
  const eventData =
    typeof eventWrapper.event.data === "function"
      ? eventWrapper.event.data()
      : eventWrapper.event.data;
  const action = await getAction();
  action(`${eventWrapper.event.originator}.${eventWrapper.event.type}`)(
    eventData,
  );
  return Promise.resolve();
}

export async function defaultTrigger(command: EntityCommand): Promise<void> {
  const action = await getAction();
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
