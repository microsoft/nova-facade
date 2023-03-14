import React from "react";
import type { NovaMockEnvironment } from "./nova-mock-environment";

import { ApolloProvider } from "@apollo/client";
import { getOperationDefinition as _getOperationDefinition } from "@apollo/client/utilities";
import type { DocumentNode, GraphQLSchema } from "graphql";

import type { MockFunctions } from "@graphitation/apollo-mock-client";
import { createMockClient } from "@graphitation/apollo-mock-client";
import * as GraphQLHooks from "@graphitation/apollo-react-relay-duct-tape";
import type { OperationDescriptor } from "@graphitation/graphql-js-operation-payload-generator";
import { generate as payloadGenerator } from "@graphitation/graphql-js-operation-payload-generator";

import type { GraphQLTaggedNode } from "@nova/react";
import type { NovaGraphQL } from "@nova/types";

type Generate<Schema, Node> = (
  operation: OperationDescriptor<Schema, Node>,
  mockResolvers?: Parameters<typeof payloadGenerator>[1],
) => ReturnType<typeof payloadGenerator>;

export const MockPayloadGenerator: {
  /**
   * Given an operation descriptor generates a payload to satisfy the request. For details on the API see
   * {@see https://github.com/microsoft/graphitation/tree/main/packages/graphql-js-operation-payload-generator}
   */
  generate: Generate<unknown, GraphQLTaggedNode>;
} = {
  generate: payloadGenerator as Generate<any, any>,
};

/**
 * Creates a Nova environment object that can be used with the NovaMockEnvironmentProvider and has mocks instantiated
 * for each piece of the facade interface.
 *
 * The `environment.graphql.mock` mock provides an API to act on operations issued by a component tree. For details on
 * the API see {@see https://github.com/microsoft/graphitation/tree/main/packages/apollo-mock-client} and for mock data
 * generation see {@see MockPayloadGenerator.generate}
 *
 * @example
 ```ts
   const environment = createMockEnvironment();
   const wrapper = mount(
     <NovaMockEnvironmentProvider environment={environment}>
       <SomeTestSubject />
     </NovaMockEnvironmentProvider>
   );

   await act(async () =>
     environment.graphql.mock.resolveMostRecentOperation(operation =>
       MockPayloadGenerator.generate(operation)
     )
   );

   wrapper.update().find("#some-button").simulate("click", {});
   expect(environment.commanding.trigger).toHaveBeenCalled();
 ```
 */
export function createMockEnvironment(
  schema: GraphQLSchema,
): NovaMockEnvironment {
  const client = createMockClient(schema);
  const env: NovaMockEnvironment = {
    commanding: {
      trigger: jest.fn(),
    },
    eventing: {
      bubble: jest.fn(),
    },
    graphql: {
      ...(GraphQLHooks as NovaGraphQL),
      mock: client.mock as MockFunctions<any, any>,
    },
    providerWrapper: ({ children }) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    ),
  };
  return env;
}

function getOperationDefinition(
  operation: OperationDescriptor<unknown, GraphQLTaggedNode>,
) {
  const definition = _getOperationDefinition(
    operation.request.node as unknown as DocumentNode,
  );
  if (!definition) {
    throw new Error(
      "Expected operation descriptor to contain a operation definition",
    );
  }
  return definition;
}

/**
 * @param operation An operation descriptor obtained from a mock environment.
 * @returns The name of the operation.
 */
export function getOperationName(
  operation: OperationDescriptor<unknown, GraphQLTaggedNode>,
) {
  const name = getOperationDefinition(operation).name?.value;
  if (!name) {
    throw new Error(
      "Expected operation descriptor to contain a named operation",
    );
  }
  return name;
}

/**
 * @param operation An operation descriptor obtained from a mock environment.
 * @returns The type of the operation.
 */
export function getOperationType(
  operation: OperationDescriptor<unknown, GraphQLTaggedNode>,
): "query" | "mutation" | "subscription" {
  return getOperationDefinition(operation).operation;
}
