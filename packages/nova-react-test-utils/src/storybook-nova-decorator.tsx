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
        | NovaEnvironmentDecoratorParameters["novaEnvironment"]
        | undefined;
      const mockResolvers = parameters?.resolvers;
      environment.graphql.mock.queueOperationResolver((operation) => {
        const payload = MockPayloadGenerator.generate(operation, mockResolvers);
        return payload;
      });
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
