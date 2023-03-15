import type { NovaMockEnvironment } from "./nova-mock-environment";
import { NovaMockEnvironmentProvider } from "./nova-mock-environment";
import { createMockEnvironment, MockPayloadGenerator } from "./test-utils";

import type { GraphQLSchema } from "graphql";
import * as React from "react";

import type { MakeDecoratorResult } from "@storybook/addons";
import { makeDecorator } from "@storybook/addons"; // it would be better to import from @storybook/preview-api but that one is available only in version 7. As long as we support both 6 and 7 we keep this import.
import { action } from "@storybook/addon-actions";

import type { MockResolvers } from "@graphitation/graphql-js-operation-payload-generator";

import type { EntityCommand, EventWrapper } from "@nova/types";

type DefaultMockResolvers = Partial<{
  ID: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  [key: string]: unknown;
}>;

export type NovaEnvironmentDecoratorParameters<
  T extends DefaultMockResolvers = DefaultMockResolvers,
> = {
  novaEnvironment: {
    resolvers?: MockResolvers<T>;
  };
};

export const getNovaEnvironmentDecorator: (
  schema: GraphQLSchema,
) => MakeDecoratorResult = (schema) =>
  makeDecorator({
    name: "withNovaEnvironment",
    parameterName: "novaEnvironment",
    wrapper: (getStory, context, settings) => {
      const environment = React.useMemo(
        () => createNovaEnvironment(schema),
        [],
      );
      const parameters = settings.parameters as
        | NovaEnvironmentDecoratorParameters
        | undefined;
      const mockResolvers = parameters?.novaEnvironment?.resolvers;
      environment.graphql.mock.queueOperationResolver((operation) =>
        MockPayloadGenerator.generate(operation, mockResolvers),
      );
      return (
        <NovaMockEnvironmentProvider environment={environment}>
          {getStory(context)}
        </NovaMockEnvironmentProvider>
      );
    },
  });

function createNovaEnvironment(
  schema: GraphQLSchema,
): NovaMockEnvironment<"storybook"> {
  const env: NovaMockEnvironment<"storybook"> = {
    ...createMockEnvironment(schema),
    commanding: {
      trigger: defaultTrigger,
    },
    eventing: {
      bubble: defaultBubble,
    },
  };
  return env;
}

function defaultBubble(eventWrapper: EventWrapper): Promise<void> {
  const eventData =
    typeof eventWrapper.event.data === "function"
      ? eventWrapper.event.data()
      : eventWrapper.event.data;
  action(`${eventWrapper.event.originator}.${eventWrapper.event.type}`)(
    eventData,
  );
  return Promise.resolve();
}

function defaultTrigger(command: EntityCommand): Promise<void> {
  action("trigger")(command);
  return Promise.resolve();
}
