import type { NovaMockEnvironment } from "../shared/nova-mock-environment";
import {
  getDecorator,
  getNovaEnvironmentForStory,
} from "../shared/storybook-nova-decorator-shared";
import type { MakeDecoratorResult } from "../shared/shared-utils";
import { defaultBubble, defaultTrigger } from "../shared/shared-utils";
import type { WithNovaEnvironment } from "../shared/storybook-nova-decorator-shared";
import { novaGraphql } from "./nova-relay-graphql";
import { RelayMockPayloadGenerator } from "./test-utils";
import * as React from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment } from "relay-test-utils";
import type { GraphQLSchema } from "graphql";
import type { ReactRenderer } from "@storybook/react";
import type { PlayFunctionContext } from "@storybook/types";
import type { EnvironmentConfig } from "relay-runtime";

type Options = { getEnvironmentOptions?: () => Partial<EnvironmentConfig> } & {
  generateFunction?: typeof RelayMockPayloadGenerator.prototype.generate;
};

export const getNovaRelayDecorator: (
  schema: GraphQLSchema,
  options?: Options,
) => MakeDecoratorResult = (
  schema,
  { generateFunction, getEnvironmentOptions } = {},
) => {
  const createEnvironment = () =>
    createNovaRelayEnvironment(getEnvironmentOptions?.());
  const relayMockPayloadGenerator = new RelayMockPayloadGenerator(schema);
  const initializeGenerator = (
    parameters: WithNovaEnvironment["novaEnvironment"],
    environment: NovaMockEnvironment<"relay", "storybook">,
  ) => {
    const mockResolvers = parameters?.resolvers;
    const generate =
      generateFunction ??
      relayMockPayloadGenerator.generate.bind(relayMockPayloadGenerator);
    environment.graphql.mock.queueOperationResolver((operation) => {
      const payload = generate(operation, mockResolvers);
      return payload;
    });
  };

  return getDecorator(createEnvironment, initializeGenerator);
};

function createNovaRelayEnvironment(
  options?: Partial<EnvironmentConfig>,
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

export const getNovaRelayEnvironmentForStory = (
  context: PlayFunctionContext<ReactRenderer>,
): NovaMockEnvironment<"relay", "storybook"> => {
  const env = getNovaEnvironmentForStory(context);
  if (env.type !== "relay") {
    throw new Error("Expected relay environment to be present on context");
  }
  return env;
};
