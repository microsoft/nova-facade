import type { NovaMockEnvironment } from "./nova-mock-environment";
import { NovaMockEnvironmentProvider } from "./nova-mock-environment";
import { MockPayloadGenerator } from "./test-utils";

import type { GraphQLSchema } from "graphql";
import * as React from "react";

import type { MakeDecoratorResult } from "@storybook/addons";
import { makeDecorator } from "@storybook/addons";
import { action } from "@storybook/addon-actions";

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

// Preferably, instead of creating module scope state, we would expose environment
// for specific story on `parameters` object by adding the property `parameters.novaEnvironment` inside
// the decorator. Unfortunately, there seems to be an issue with Storybook that the parameters passed to `play`
// function are not getting updated, even if they were changed in the decorator. We should remove the modules scope
// once the issue is fixed upstream. Check https://github.com/storybookjs/storybook/issues/21252#issuecomment-1447777629
// for details.
const Envs: Record<string, NovaMockEnvironment<"storybook">> = {};

export const getEnvForStory = (storyId: string) => {
  const env = Envs[storyId];
  if (!env) {
    throw new Error(
      `No environment found for story "${storyId}". Did you forget to add the "withNovaEnvironment" decorator? Remember that you can call "getEnvForStory" only once per story play function.`,
    );
  }
  delete Envs[storyId];
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
      // TODO: change to rely on `context.id` when https://github.com/storybookjs/storybook/pull/22471 is merged and released
      Envs[context.name] = environment;
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
