import type { NovaMockEnvironment } from "@nova/react-test-utils";
import * as React from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment } from "relay-test-utils";
import {
  type MockResolvers,
  generate as payloadGenerator,
} from "@graphitation/graphql-js-operation-payload-generator";
import type { OperationDescriptor as RelayOperationDescriptor } from "relay-runtime";
import { novaGraphql } from "./nova-relay-graphql";
import {
  getDecorator,
  getNovaEnvironmentForStory,
  type WithNovaEnvironment,
} from "./storybook-nova-decorator-shared";
import { defaultBubble, defaultTrigger } from "./shared-utils";
import { type GraphQLSchema, parse as parseGraphQL } from "graphql";
import type { ReactRenderer } from "@storybook/react";
import type { PlayFunctionContext } from "@storybook/types";

type RelayEnvironmentOptions = Parameters<typeof createMockEnvironment>[0];

export const getNovaRelayDecorator = (
  schema: GraphQLSchema,
  options?: RelayEnvironmentOptions,
) => {
  const createEnvironment = () => createNovaRelayEnvironment(options);
  const relayMockPayloadGenerator = new RelayMockPayloadGenerator(schema);
  const initializeGenerator = (
    parameters: WithNovaEnvironment["novaEnvironment"],
    environment: NovaMockEnvironment<"relay", "storybook">,
  ) => {
    const mockResolvers = parameters?.resolvers;
    environment.graphql.mock.queueOperationResolver((operation) => {
      const payload = relayMockPayloadGenerator.generate(
        operation,
        mockResolvers,
      );
      return payload;
    });
  };

  return getDecorator(createEnvironment, initializeGenerator);
};

function createNovaRelayEnvironment(
  options?: RelayEnvironmentOptions,
): NovaMockEnvironment<"relay", "storybook"> {
  const relayEnvironment = createMockEnvironment(options);
  const env: NovaMockEnvironment<"relay", "storybook"> = {
    type: "relay",
    graphql: {
      ...novaGraphql,
      mock: relayEnvironment.mock,
    },
    providerWrapper: ({ children }: React.PropsWithChildren<unknown>) => (
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <React.Suspense fallback={<div>Component suspended...</div>}>
          {children}
        </React.Suspense>
      </RelayEnvironmentProvider>
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

export class RelayMockPayloadGenerator {
  public gqlSchema: GraphQLSchema;

  constructor(gqlSchema: GraphQLSchema) {
    this.gqlSchema = gqlSchema;
  }

  public generate(
    operation: RelayOperationDescriptor,
    mockResolvers?: MockResolvers,
    generateId?: () => number,
  ): ReturnType<typeof payloadGenerator> {
    if (!operation.request.node.params.text) {
      throw new Error("Expected operation descriptor to have operation text");
    }
    const { data } = payloadGenerator(
      {
        schema: this.gqlSchema,
        request: {
          variables: operation.request.variables,
          node: parseGraphQL(operation.request.node.params.text),
        },
      },
      mockResolvers,
      false,
      generateId,
    );
    // Create a copy of the data which creates objects with prototypes,
    // because graphql-js doesn't do this and it makes it impossible for
    // relay to use Object.prototype methods on the data.
    return { data: JSON.parse(JSON.stringify(data)) };
  }
}

export const getNovaRelayEnvironmentForStory = (
  context: PlayFunctionContext<ReactRenderer>,
): NovaMockEnvironment<"relay", "storybook"> => {
  const env = getNovaEnvironmentForStory(context);
  if (env.type !== "relay") {
    throw new Error("Expected relay environment to be present on context");
  }
  return env;
};
