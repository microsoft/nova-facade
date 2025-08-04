import {
  getDecorator,
  getNovaEnvironmentForStory,
  type MockResolvers,
} from "../shared/storybook-nova-decorator-shared";
import type { MakeDecoratorResult } from "../shared/shared-utils";
import {
  defaultBubble,
  defaultLocalization,
  defaultTrigger,
} from "../shared/shared-utils";
import type { WithNovaEnvironment } from "../shared/storybook-nova-decorator-shared";
import { novaGraphql } from "./nova-relay-graphql";
import { RelayMockPayloadGenerator } from "./test-utils";
import * as React from "react";
import { RelayEnvironmentProvider } from "react-relay";
import {
  createMockEnvironment,
  type MockResolver,
  type DefaultMockResolvers,
  type MockPayloadGenerator,
} from "relay-test-utils";
import type { GraphQLSchema } from "graphql";
import type { ReactRenderer } from "@storybook/react";
import type { PlayFunctionContext } from "@storybook/types";
import type { NovaMockEnvironment } from "./nova-mock-environment";
import { RecordSource, Store, type EnvironmentConfig } from "relay-runtime";
import type { NovaLocalization } from "@nova/types";

// We need this as `generateWithDefer` is overloaded and we want to get most relaxed return type
type OverloadedReturnType<T> = T extends {
  (...args: any[]): infer R;
  (...args: any[]): infer R;
}
  ? R
  : T extends (...args: any[]) => infer R
    ? R
    : any;

type GraphitationGenerateArgs = Parameters<
  RelayMockPayloadGenerator["generate"]
>;

// We put very relaxed constraints on the return type here, because we want users to be able to use
// Relay's payload generator for example for having returned deferred payloads or mocking client extensions,
// which doesn't work with graphitation's payload generator.
type RelayGenerateReturn =
  | ReturnType<(typeof MockPayloadGenerator)["generate"]>
  | OverloadedReturnType<(typeof MockPayloadGenerator)["generateWithDefer"]>;

type StoreOptions = ConstructorParameters<typeof Store>[1];

type EnvironmentOptions = Partial<EnvironmentConfig> & {
  storeOptions?: StoreOptions;
};

type Options = { getEnvironmentOptions?: () => EnvironmentOptions } & {
  generateFunction?: (...args: GraphitationGenerateArgs) => RelayGenerateReturn;
} & { localization?: NovaLocalization };

export const getNovaRelayDecorator: (
  schema: GraphQLSchema,
  options?: Options,
) => MakeDecoratorResult = (
  schema,
  { generateFunction, getEnvironmentOptions, localization } = {},
) => {
  const createEnvironment = (
    parameters?: WithNovaEnvironment["novaEnvironment"],
  ) =>
    createNovaRelayEnvironment(
      getEnvironmentOptions?.(),
      localization,
      parameters?.resolvers,
    );
  const relayMockPayloadGenerator = new RelayMockPayloadGenerator(schema);
  const initializeGenerator = (
    parameters: WithNovaEnvironment["novaEnvironment"],
    environment: NovaMockEnvironment,
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

export type EnvironmentMockResolversContext<
  TypeMap extends DefaultMockResolvers = DefaultMockResolvers,
> = {
  mock: {
    resolve: <K extends keyof TypeMap>(
      typeName: K,
      context?: Partial<MockResolverContext>,
    ) => TypeMap[K];
    storeById: (id: string, data: unknown) => void;
    resolveById: (id: string) => unknown;
  };
};

function createNovaRelayEnvironment(
  options?: EnvironmentOptions,
  localization?: NovaLocalization,
  resolvers?: MockResolvers,
): NovaMockEnvironment {
  const resolverContext = getResolverContextForEnvironment(resolvers ?? {});

  const storeConfiguration: StoreOptions = options?.storeOptions
    ? {
        ...options.storeOptions,
        resolverContext: {
          ...(options?.storeOptions?.resolverContext ?? {}),
          ...resolverContext,
        },
      }
    : { resolverContext };

  const store =
    options?.store ?? new Store(new RecordSource(), storeConfiguration);

  const relayEnvironment = createMockEnvironment({
    ...options,
    store,
  });

  const env: NovaMockEnvironment = {
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
    localization: localization ?? defaultLocalization,
  };
  return env;
}

export const getNovaRelayEnvironmentForStory = (
  context: PlayFunctionContext<ReactRenderer>,
): NovaMockEnvironment => {
  const env = getNovaEnvironmentForStory(context);
  if (!isRelayMockEnv(env)) {
    throw new Error("Expected relay environment to be present on context");
  }
  return env;
};

const isRelayMockEnv = (
  env: ReturnType<typeof getNovaEnvironmentForStory>,
): env is NovaMockEnvironment => env.type === "relay";

type MockResolverContext = Parameters<MockResolver>[0];

const getResolverContextForEnvironment: (
  resolvers: MockResolvers,
) => EnvironmentMockResolversContext = (resolvers) => {
  const dataById = new Map<string, unknown>();
  let currentId = 0;

  const defaultResolvers: MockResolvers<DefaultMockResolvers> = {
    ID: (context) =>
      `${context?.parentType ? context.parentType + "-" : ""}mock-id-${currentId++}`,
    Int: () => 42,
    Float: () => 4.2,
    Boolean: () => false,
  };

  const allResolvers = {
    ...defaultResolvers,
    ...resolvers,
  };

  const resolverContext: EnvironmentMockResolversContext = {
    mock: {
      resolve: (typeName, context) => {
        const resolver = allResolvers[typeName];
        return resolver?.(
          (context ?? {}) as MockResolverContext,
          () => currentId++,
        );
      },
      storeById: (id, data) => {
        dataById.set(id, data);
      },
      resolveById: (id) => {
        return dataById.get(id);
      },
    },
  };

  return resolverContext;
};
