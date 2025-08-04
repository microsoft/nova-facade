import * as React from "react";
import { type GraphQLTaggedNode, useLazyLoadQuery } from "@nova/react";
import { type GraphQLTaggedNode as RelayGraphQLTaggedNode } from "relay-runtime";
import type { MockResolvers } from "@graphitation/graphql-js-operation-payload-generator";
import type {
  Addon_LegacyStoryFn,
  ComposedStoryFn,
  PlayFunctionContext,
} from "@storybook/types";
import { makeDecorator } from "@storybook/preview-api";
import type { NovaMockEnvironment } from "./nova-mock-environment";
import { NovaMockEnvironmentProvider } from "./nova-mock-environment";
import type { ReactRenderer } from "@storybook/react";
import type { OperationType } from "relay-runtime";

type Context = Parameters<Parameters<typeof makeDecorator>[0]["wrapper"]>[1];

export type { MockResolvers };
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

export type WithNovaEnvironment<
  TQuery extends OperationType = UnknownOperation,
  TypeMap extends DefaultMockResolvers = DefaultMockResolvers,
> = {
  novaEnvironment: (
    | {
        query: GraphQLTaggedNode | RelayGraphQLTaggedNode;
        variables?: TQuery["variables"];
        referenceEntries: Record<
          string,
          (queryResult: TQuery["response"]) => unknown
        >;
      }
    | {
        query?: never;
        variables?: never;
        referenceEntries?: never;
      }
  ) &
    (
      | {
          enableQueuedMockResolvers?: true;
          resolvers?: MockResolvers<TypeMap>;
        }
      | {
          enableQueuedMockResolvers?: false;
          resolvers?: never;
        }
    );
};

type RendererProps = {
  params: WithNovaEnvironment["novaEnvironment"];
  context: Context;
  getStory: Addon_LegacyStoryFn;
};

const Renderer: React.FC<RendererProps> = ({
  params: { query, variables = {}, referenceEntries = {} },
  context,
  getStory,
}) => {
  if (query) {
    const { data, error } = useLazyLoadQuery(
      // There are no consequences of the cast, we do it only to make sure pure relay components can also leverage the decorator
      query as GraphQLTaggedNode,
      variables,
    );

    // apollo does not suspend, but returns undefined data
    if (!data) {
      if (error) {
        // apollo returns an error, while Relay throws, let's align the behavior
        throw error;
      }
      return <div>Loading...</div>;
    }

    const entries = Object.entries(referenceEntries).map(
      ([key, getValue]) => [key, getValue(data)] as const,
    );
    Object.assign(context.args, Object.fromEntries(entries));
    return <>{getStory(context) as React.ReactNode}</>;
  } else {
    return <>{getStory(context) as React.ReactNode}</>;
  }
};

const NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR =
  "novaEnvironmentAssignedParameterValue";

export const getDecorator = <E extends NovaMockEnvironment>(
  createEnvironment: (parameters?: WithNovaEnvironment["novaEnvironment"]) => E,
  initializeGenerator: (
    parameters: WithNovaEnvironment["novaEnvironment"],
    environment: E,
  ) => void,
) => {
  return makeDecorator({
    name: "withNovaEnvironment",
    parameterName: "novaEnvironment",
    wrapper: (getStory, context, settings) => {
      const parameters = (settings.parameters ??
        {}) as WithNovaEnvironment["novaEnvironment"];
      // Environment needs to be created within makeDecorator wrapper to ensure it is created for each story separately and the environment is not shared between stories.
      // Pass parameters to createEnvironment so it can configure Relay resolver context
      const environment = React.useMemo(
        () => createEnvironment(parameters),
        [],
      );
      if (parameters.enableQueuedMockResolvers ?? true) {
        initializeGenerator(parameters, environment);
      }

      context.parameters[NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR] = environment;
      return (
        <NovaMockEnvironmentProvider environment={environment}>
          <Renderer params={parameters} context={context} getStory={getStory} />
        </NovaMockEnvironmentProvider>
      );
    },
  });
};

// This function is used to create play function context for a story used inside unit test, leveraging composeStories/composeStory.
export const prepareStoryContextForTest = (
  story: ComposedStoryFn<ReactRenderer>,
  canvasElement: HTMLElement,
): Partial<PlayFunctionContext<ReactRenderer>> => ({
  canvasElement,
  id: story.id,
  parameters: story.parameters,
});

// This function should be used inside `play` function of a story to get the nova environment for that story.
export const getNovaEnvironmentForStory = (
  context: PlayFunctionContext<ReactRenderer>,
) => {
  const env = context.parameters?.[NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR] as
    | NovaMockEnvironment
    | undefined;
  if (!env) {
    throw new Error(
      `No environment found for story "${context.id}". Did you forget to add the "withNovaEnvironment" decorator or pass proper context to "play" function inside your unit test?`,
    );
  }
  return env;
};
