// This file is a implementation of relay based Nova decorator that contains the set of features from both @nova/react-test-utils
// and @imchhh/storybook-addon-relay. We will push it upstream but have it here for now to allow teams leveraging it
import { makeDecorator } from "@storybook/preview-api";
import { useLazyLoadQuery, type GraphQLTaggedNode } from "@nova/react";
import {
  NovaMockEnvironmentProvider,
  type NovaEnvironmentDecoratorParameters,
  type NovaMockEnvironment,
} from "@nova/react-test-utils";
import * as React from "react";
import {
  RelayEnvironmentProvider,
  type OperationDescriptor,
} from "react-relay";
// In upstream we should probably start using MockPayloadGenerator from relay-test-utils instead of @graphitation one
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import type { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { defaultBubble, defaultTrigger } from "./test-utils";
import type { Addon_LegacyStoryFn, DecoratorFunction } from "@storybook/types";
import type { OperationType, GraphQLSingularResponse } from "relay-runtime";
import * as ReactRelayHooks from "react-relay/hooks";
import type { NovaGraphQL } from "@nova/types";
import { RecordSource, RelayFeatureFlags, Store } from "relay-runtime";
import { novaGraphql } from "./novaRelayGraphql";

export type DefaultMockResolvers = Partial<{
  ID: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  [key: string]: unknown;
}>;

export type UnknownOperation = {
  variables: Record<string, unknown>;
  response: unknown;
};

const NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR =
  "novaEnvironmentAssignedParameterValue";

export type WithNovaEnvironment<
  TQuery extends OperationType = UnknownOperation,
  TypeMap extends DefaultMockResolvers = DefaultMockResolvers,
> = {
  novaEnvironment: (
    | ({
        query: GraphQLTaggedNode;
        variables?: TQuery["variables"];
      } & (
        | {
            getReferenceEntry: (
              queryResult: TQuery["response"],
            ) => [string, unknown];
            getReferenceEntries?: never;
          }
        | {
            getReferenceEntries: (
              queryResult: TQuery["response"],
            ) => Array<[string, unknown]>;
            getReferenceEntry?: never;
          }
      ))
    | {
        query?: never;
        variables?: never;
        getReferenceEntry?: never;
        getReferenceEntries?: never;
      }
  ) & {
    generateFunction?: (
      operation: OperationDescriptor,
      mockResolvers?: MockResolvers | null,
    ) => GraphQLSingularResponse;
  } & NovaEnvironmentDecoratorParameters<TypeMap>["novaEnvironment"];
};

type Context = Parameters<Parameters<typeof makeDecorator>[0]["wrapper"]>[1];

export const getNovaRelayEnvironmentDecorator = () =>
  makeDecorator({
    name: "withNovaEnvironment",
    parameterName: "novaEnvironment",
    wrapper: (getStory, context, settings) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const environment = React.useMemo(() => createNovaRelayEnvironment(), []);
      const parameters =
        settings.parameters as WithNovaEnvironment["novaEnvironment"];
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

function getRenderer(
  {
    query,
    variables = {},
    getReferenceEntries,
    getReferenceEntry,
  }: WithNovaEnvironment["novaEnvironment"],
  context: Context,
  getStory: Addon_LegacyStoryFn,
): React.FC<React.PropsWithChildren<unknown>> {
  if (query) {
    const Renderer: React.FC<{}> = () => {
      const { data } = useLazyLoadQuery(query, variables);
      const entries = getReferenceEntries
        ? getReferenceEntries(data)
        : [getReferenceEntry(data)];
      Object.assign(context.args, Object.fromEntries(entries));
      return <>{getStory(context)}</>;
    };
    return Renderer;
  } else {
    // eslint-disable-next-line react/display-name
    return () => {
      return <>{getStory(context)}</>;
    };
  }
}

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
