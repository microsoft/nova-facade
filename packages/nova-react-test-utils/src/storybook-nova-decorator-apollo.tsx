import type { NovaMockEnvironment } from "./nova-mock-environment";
import { NovaMockEnvironmentProvider } from "./nova-mock-environment";
import {
  defaultBubble,
  defaultTrigger,
  MockPayloadGenerator,
} from "./test-utils";

import type { GraphQLSchema } from "graphql";
import * as React from "react";

import { makeDecorator } from "@storybook/preview-api";
import type {
  ComposedStoryPlayContext,
  PlayFunctionContext,
  ComposedStoryFn,
} from "@storybook/types";
import type { ReactRenderer } from "@storybook/react";

import * as GraphQLHooks from "@graphitation/apollo-react-relay-duct-tape";
import type { MockFunctions } from "@graphitation/apollo-mock-client";
import { createMockClient } from "@graphitation/apollo-mock-client";

import type { NovaGraphQL } from "@nova/types";
import { ApolloProvider } from "@apollo/client";
import type { WithNovaEnvironment } from "./storybook-nova-decorator-shared";

// this has to be unique and different then name of the property added on story level to parameters
// otherwise editing it within the decorator will override the mock resolvers
const NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR =
  "novaEnvironmentAssignedParameterValue";

type MockClientOptions = Parameters<typeof createMockClient>[1];

type MakeDecoratorResult = ReturnType<typeof makeDecorator>;

// This function is used to create play function context for a story used inside unit test, leveraging composeStories/composeStory.
export const prepareStoryContextForTest = (
  story: ComposedStoryFn<ReactRenderer>,
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
  const env = context.parameters?.[NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR] as
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
  options?: MockClientOptions,
) => MakeDecoratorResult = (schema, options) =>
  makeDecorator({
    name: "withNovaEnvironment",
    parameterName: "novaEnvironment",
    wrapper: (getStory, context, settings) => {
      const environment = React.useMemo(
        () => createNovaEnvironment(schema, options),
        [],
      );
      const parameters = settings.parameters as
        | WithNovaEnvironment["novaEnvironment"];
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
      context.parameters[NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR] = environment;
      return (
        <NovaMockEnvironmentProvider environment={environment}>
          {getStory(context)}
        </NovaMockEnvironmentProvider>
      );
    },
  });

function createNovaEnvironment(
  schema: GraphQLSchema,
  options?: MockClientOptions,
): NovaMockEnvironment<"storybook"> {
  const client = createMockClient(schema, options);
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
