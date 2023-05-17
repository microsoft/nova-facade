import type { NovaMockEnvironment } from "./nova-mock-environment";
import { NovaMockEnvironmentProvider } from "./nova-mock-environment";
import { MockPayloadGenerator } from "./test-utils";

import type { GraphQLSchema } from "graphql";
import * as React from "react";

import type { MakeDecoratorResult } from "@storybook/addons";
import { makeDecorator } from "@storybook/addons";
import { action } from "@storybook/addon-actions";
import type {
  ComposedStoryPlayContext,
  PlayFunctionContext,
  PreparedStoryFn,
} from "@storybook/types";
import type { ReactRenderer } from "@storybook/react";

import type { MockResolvers } from "@graphitation/graphql-js-operation-payload-generator";
import * as GraphQLHooks from "@graphitation/apollo-react-relay-duct-tape";
import type { MockFunctions } from "@graphitation/apollo-mock-client";
import { createMockClient } from "@graphitation/apollo-mock-client";

import type { EntityCommand, EventWrapper, NovaGraphQL } from "@nova/types";
import { ApolloProvider } from "@apollo/client";

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
  novaEnvironment:
    | {
        enableQueuedMockResolvers?: true;
        resolvers?: MockResolvers<T>;
      }
    | {
        enableQueuedMockResolvers?: false;
        resolvers?: never;
      };
};

// This function is used to create play function context for a story used inside unit test, leveraging composeStories/composeStory.
export const prepareStoryContextForTest = (
  story: PreparedStoryFn<ReactRenderer>,
  canvasElement?: HTMLElement,
): ComposedStoryPlayContext<ReactRenderer> => ({
  canvasElement,
  id: story.id,
  parameters: story.parameters,
});

// This function should be used inside `play` function of a story to get the nova environment for that story.
export const getNovaEnvironmentForStory = (
  context: PlayFunctionContext<ReactRenderer>,
) => {
  const env = context.parameters?.novaEnvironment as
    | NovaMockEnvironment<"storybook">
    | undefined;
  if (!env) {
    throw new Error(
      `No environment found for story "${context.storyId}". Did you forget to add the "withNovaEnvironment" decorator or pass proper context to "play" function inside your unit test?`,
    );
  }
  return env;
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
        | NovaEnvironmentDecoratorParameters["novaEnvironment"];
      if (parameters?.enableQueuedMockResolvers ?? true) {
        const mockResolvers = parameters?.resolvers;
        environment.graphql.mock.queueOperationResolver((operation) => {
          const payload = MockPayloadGenerator.generate(
            operation,
            mockResolvers,
          );
          return payload;
        });
      }
      // As discussed in https://github.com/storybookjs/storybook/issues/21252#issuecomment-1550573564 this works but is a bit fragile.
      // Long term hopefully there is a solution to update the context object itself in a more robust way. In case this stops working after
      // a storybook update, we can change this code to keep a module scope state with dictionary of environments where story id is a key. That
      // approach was implemented in initial iterations of https://github.com/microsoft/nova-facade/pull/72
      context.parameters.novaEnvironment = environment;
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
  const client = createMockClient(schema);
  const env: NovaMockEnvironment<"storybook"> = {
    graphql: {
      ...(GraphQLHooks as NovaGraphQL),
      mock: client.mock as MockFunctions<any, any>,
    },
    providerWrapper: ({ children }) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    ),
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
