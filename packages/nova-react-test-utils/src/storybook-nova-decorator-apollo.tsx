import type { NovaMockEnvironment } from "./nova-mock-environment";
import { NovaMockEnvironmentProvider } from "./nova-mock-environment";
import { MockPayloadGenerator } from "./test-utils";

import type { GraphQLSchema } from "graphql";
import * as React from "react";

import { makeDecorator } from "@storybook/preview-api";

import * as GraphQLHooks from "@graphitation/apollo-react-relay-duct-tape";
import type { MockFunctions } from "@graphitation/apollo-mock-client";
import { createMockClient } from "@graphitation/apollo-mock-client";

import type { NovaGraphQL } from "@nova/types";
import { ApolloProvider } from "@apollo/client";
import {
  getDecorator,
  getRenderer,
  type WithNovaEnvironment,
} from "./storybook-nova-decorator-shared";
import { defaultTrigger, defaultBubble } from "./shared-utils";

// this has to be unique and different then name of the property added on story level to parameters
// otherwise editing it within the decorator will override the mock resolvers
const NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR =
  "novaEnvironmentAssignedParameterValue";

type MockClientOptions = Parameters<typeof createMockClient>[1];

type MakeDecoratorResult = ReturnType<typeof makeDecorator>;

export const getNovaApolloDecorator: (
  schema: GraphQLSchema,
  options?: MockClientOptions,
) => MakeDecoratorResult = (schema, options) => {
  const environment = createNovaEnvironment(schema, options);
  const initializeGenerator = (parameters: WithNovaEnvironment["novaEnvironment"]) => {
    const mockResolvers = parameters?.resolvers;
    environment.graphql.mock.queueOperationResolver((operation) => {
      const payload = MockPayloadGenerator.generate(operation, mockResolvers);
      return payload;
    });
  };

  return getDecorator(environment, initializeGenerator);
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
      const parameters =
        (settings.parameters as WithNovaEnvironment["novaEnvironment"]) || {};
      const Renderer = getRenderer(parameters, context, getStory);
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
          <Renderer />
        </NovaMockEnvironmentProvider>
      );
    },
  });

function createNovaEnvironment(
  schema: GraphQLSchema,
  options?: MockClientOptions,
): NovaMockEnvironment<"apollo", "storybook"> {
  const client = createMockClient(schema, options);
  const env: NovaMockEnvironment<"apollo", "storybook"> = {
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
