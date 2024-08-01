import * as React from "react";
import { GraphQLTaggedNode, useLazyLoadQuery } from "@nova/react";
import type {
  OperationType,
  GraphQLSingularResponse,
  OperationDescriptor,
} from "relay-runtime";
import type { MockResolvers } from "relay-test-utils";
import type { NovaEnvironmentDecoratorParameters } from "@nova/react-test-utils";
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
