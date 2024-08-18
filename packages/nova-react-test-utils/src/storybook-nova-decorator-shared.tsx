import * as React from "react";
import { type GraphQLTaggedNode, useLazyLoadQuery } from "@nova/react";
import type {
  MockResolvers,
  OperationDescriptor as ApolloOperationDescription,
} from "@graphitation/graphql-js-operation-payload-generator";
import type {
  Addon_LegacyStoryFn,
  ComposedStoryFn,
  ComposedStoryPlayContext,
  PlayFunctionContext,
} from "@storybook/types";
import { makeDecorator } from "@storybook/preview-api";
import type { NovaMockEnvironment } from "./nova-mock-environment";
import { NovaMockEnvironmentProvider } from "./nova-mock-environment";
import type { ReactRenderer } from "@storybook/react";
import type { OperationType } from "relay-runtime";
import type { Variant } from "./shared-utils";

type Context = Parameters<Parameters<typeof makeDecorator>[0]["wrapper"]>[1];

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

export function getRenderer(
  {
    query,
    variables = {},
    getReferenceEntries,
    getReferenceEntry,
  }: WithNovaEnvironment["novaEnvironment"],
  context: Context,
  getStory: Addon_LegacyStoryFn,
): React.FC<React.PropsWithChildren<unknown>> {
  console.log({query, variables, getReferenceEntries, getReferenceEntry});
  if (query) {
    const Renderer: React.FC<unknown> = () => {
      const { data } = useLazyLoadQuery(query, variables);
      console.log({data, query, variables});

      // apollo does not suspend, but returns undefined data
      if (!data) {
        return <div>Loading...</div>;
      }

      const entries = getReferenceEntries
        ? getReferenceEntries(data)
        : [getReferenceEntry(data)];
      Object.assign(context.args, Object.fromEntries(entries));
      return <>{getStory(context)}</>;
    };
    return Renderer;
  } else {
    return () => {
      return <>{getStory(context)}</>;
    };
  }
}

const NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR =
  "novaEnvironmentAssignedParameterValue";

export const getDecorator = <V extends Variant = "apollo">(
  environment: NovaMockEnvironment<V, "storybook">,
  initializeGenerator: (
    parameters: WithNovaEnvironment["novaEnvironment"],
  ) => void,
) => {
  return makeDecorator({
    name: "withNovaEnvironment",
    parameterName: "novaEnvironment",
    wrapper: (getStory, context, settings) => {
      const parameters =
        settings.parameters as WithNovaEnvironment["novaEnvironment"];
      const Renderer = getRenderer(parameters, context, getStory);
      if (parameters.enableQueuedMockResolvers) {
        initializeGenerator(parameters);
      }

      context.parameters[NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR] = environment;
      return (
        <NovaMockEnvironmentProvider environment={environment}>
          <Renderer />
        </NovaMockEnvironmentProvider>
      );
    },
  });
};

// This function is used to create play function context for a story used inside unit test, leveraging composeStories/composeStory.
export const prepareStoryContextForTest = (
  story: ComposedStoryFn<ReactRenderer>,
  canvasElement?: HTMLElement,
): ComposedStoryPlayContext<ReactRenderer> => ({
  canvasElement,
  id: story.id,
  parameters: story.parameters,
});

// This function should be used inside `play` function of a story to get the nova environment for that story.
export const getNovaEnvironmentForStory = <V extends Variant>(
  context: PlayFunctionContext<ReactRenderer>,
) => {
  const env = context.parameters?.[NAME_OF_ASSIGNED_PARAMETER_IN_DECORATOR] as
    | NovaMockEnvironment<V, "storybook">
    | undefined;
  if (!env) {
    throw new Error(
      `No environment found for story "${context.storyId}". Did you forget to add the "withNovaEnvironment" decorator or pass proper context to "play" function inside your unit test?`,
    );
  }
  return env;
};
