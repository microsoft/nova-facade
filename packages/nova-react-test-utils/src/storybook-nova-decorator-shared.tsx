import * as React from "react";
import { type GraphQLTaggedNode, useLazyLoadQuery } from "@nova/react";
import type {
  OperationType,
  GraphQLSingularResponse,
  OperationDescriptor,
} from "relay-runtime";
import type { MockResolvers as RelayMockResolvers } from "relay-test-utils";
import type { MockResolvers as GraphitationMockResolvers } from "@graphitation/graphql-js-operation-payload-generator";
import type { Addon_LegacyStoryFn } from "@storybook/types";
import type { makeDecorator } from "@storybook/preview-api";

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

export type WithNovaRelayEnvironment<
  TQuery extends OperationType = UnknownOperation,
  TypeMap extends DefaultMockResolvers = DefaultMockResolvers,
> = WithNovaEnvironment<TQuery, TypeMap, RelayMockResolvers>;

export type WithNovaApolloEnvironment<
  TQuery extends OperationType = UnknownOperation,
  TypeMap extends DefaultMockResolvers = DefaultMockResolvers,
> = WithNovaEnvironment<TQuery, TypeMap, GraphitationMockResolvers>;

export type WithNovaEnvironment<
  TQuery extends OperationType = UnknownOperation,
  TypeMap extends DefaultMockResolvers = DefaultMockResolvers,
  TMockResolvers =
    | RelayMockResolvers<TypeMap>
    | GraphitationMockResolvers<TypeMap>,
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
      mockResolvers?:
        | RelayMockResolvers<TypeMap>
        | GraphitationMockResolvers<TypeMap>,
    ) => GraphQLSingularResponse;
  } & (
      | {
          enableQueuedMockResolvers?: true;
          resolvers?: TMockResolvers;
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
  if (query) {
    const Renderer: React.FC<unknown> = () => {
      const { data } = useLazyLoadQuery(query, variables);

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
