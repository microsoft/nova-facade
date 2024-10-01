import { ApolloMockPayloadGenerator } from "./test-utils";
import type { GraphQLSchema } from "graphql";
import * as React from "react";
import * as GraphQLHooks from "@graphitation/apollo-react-relay-duct-tape";
import type { MockFunctions } from "@graphitation/apollo-mock-client";
import { createMockClient } from "@graphitation/apollo-mock-client";
import type { NovaGraphQL } from "@nova/types";
import { ApolloProvider } from "@apollo/client";
import {
  getDecorator,
  getNovaEnvironmentForStory,
  type WithNovaEnvironment,
} from "../shared/storybook-nova-decorator-shared";
import type { MakeDecoratorResult } from "../shared/shared-utils";
import { defaultTrigger, defaultBubble } from "../shared/shared-utils";
import type { ReactRenderer } from "@storybook/react";
import type { PlayFunctionContext } from "@storybook/types";
import type { NovaMockEnvironment } from "./nova-mock-environment";

type MockClientOptions = Parameters<typeof createMockClient>[1];

type Options = MockClientOptions & {
  generateFunction?: typeof ApolloMockPayloadGenerator.generate;
};

export const getNovaApolloDecorator: (
  schema: GraphQLSchema,
  options?: Options,
) => MakeDecoratorResult = (schema, { generateFunction, ...rest } = {}) => {
  const createEnvironment = () => createNovaEnvironment(schema, rest);
  const initializeGenerator = (
    parameters: WithNovaEnvironment["novaEnvironment"],
    environment: NovaMockEnvironment<"storybook">,
  ) => {
    const mockResolvers = parameters?.resolvers;
    const generate = generateFunction ?? ApolloMockPayloadGenerator.generate;
    environment.graphql.mock.queueOperationResolver((operation) => {
      const payload = generate(operation, mockResolvers);
      return payload;
    });
  };

  return getDecorator(createEnvironment, initializeGenerator);
};

function createNovaEnvironment(
  schema: GraphQLSchema,
  options?: MockClientOptions,
): NovaMockEnvironment<"storybook"> {
  const client = createMockClient(schema, options);
  const env: NovaMockEnvironment<"storybook"> = {
    type: "apollo",
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

export const getNovaApolloEnvironmentForStory = (
  context: PlayFunctionContext<ReactRenderer>,
): NovaMockEnvironment<"storybook"> => {
  const env = getNovaEnvironmentForStory(context);
  if (!isApolloEnvironment(env)) {
    throw new Error("Expected relay environment to be present on context");
  }
  return env;
};

const isApolloEnvironment = (
  env: ReturnType<typeof getNovaEnvironmentForStory>,
): env is NovaMockEnvironment<"storybook"> => {
  return env.type === "apollo";
};
