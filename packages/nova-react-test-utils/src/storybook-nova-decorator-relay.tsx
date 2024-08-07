// This file is a implementation of relay based Nova decorator that contains the set of features from both @nova/react-test-utils
// and @imchhh/storybook-addon-relay. We will push it upstream but have it here for now to allow teams leveraging it
import { makeDecorator } from "@storybook/preview-api";
import {
  NovaMockEnvironmentProvider,
  type NovaMockEnvironment,
} from "@nova/react-test-utils";
import * as React from "react";
import { RelayEnvironmentProvider } from "react-relay";
// In upstream we should probably start using MockPayloadGenerator from relay-test-utils instead of @graphitation one
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { defaultBubble, defaultTrigger } from "./test-utils";
import type { DecoratorFunction } from "@storybook/types";
import { RecordSource, RelayFeatureFlags, Store } from "relay-runtime";
import { novaGraphql } from "./nova-relay-graphql";
import {
  getRenderer,
  type WithNovaEnvironment,
} from "./storybook-nova-decorator-shared";

const NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR =
  "novaEnvironmentAssignedParameterValue";

export const getNovaRelayEnvironmentDecorator = () =>
  makeDecorator({
    name: "withNovaEnvironment",
    parameterName: "novaEnvironment",
    wrapper: (getStory, context, settings) => {
      const environment = React.useMemo(() => createNovaRelayEnvironment(), []);
      const parameters =
        (settings.parameters as WithNovaEnvironment["novaEnvironment"]) || {};
      const Renderer = getRenderer(parameters, context, getStory);
      if (parameters?.enableQueuedMockResolvers ?? true) {
        const mockResolvers = parameters?.resolvers;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - here again typings between apollo and relay are not compatible, we will need to figure it out upstream
        environment.graphql.mock.queueOperationResolver((operation) => {
          if (parameters.generateFunction) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - here again typings between apollo and relay are not compatible, we will need to figure it out upstream
            return parameters.generateFunction(operation, mockResolvers);
          } else {
            return MockPayloadGenerator.generateWithDefer(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              operation,
              mockResolvers,
              {
                generateDeferredPayload: true,
                mockClientData: true,
              },
            );
          }
        });
      }
      context.parameters[NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR] = environment;
      return (
        <NovaMockEnvironmentProvider environment={environment}>
          <Renderer />
        </NovaMockEnvironmentProvider>
      );
    },
  });

function createNovaRelayEnvironment(): NovaMockEnvironment<"storybook"> {
  // When we move upstream, decorator should accept the environment as a parameter to be able to override the store
  const relayEnvironment = createMockEnvironment({
    store: createStore(),
  });
  const env: NovaMockEnvironment<"storybook"> = {
    graphql: {
      ...novaGraphql,
      // The getAllOperations result needs to be readonly
      mock: relayEnvironment.mock as unknown as NovaMockEnvironment["graphql"]["mock"],
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

export const novaRelayDecorator: DecoratorFunction =
  getNovaRelayEnvironmentDecorator();

export function createStore(): Store {
  // Enable feature flags for Live Resolver support
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;

  return new Store(new RecordSource());
}
