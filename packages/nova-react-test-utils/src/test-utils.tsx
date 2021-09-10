import * as React from "react";
import { NovaMockEnvironment } from "./nova-mock-environment";

import { ApolloProvider } from "@apollo/client";
import { getOperationDefinition as _getOperationDefinition } from "@apollo/client/utilities";
import { buildClientSchema, DocumentNode, GraphQLSchema } from "graphql";

import {
  createMockClient,
  MockFunctions
} from "@graphitation/apollo-mock-client";
import * as GraphQLHooks from "@graphitation/apollo-react-relay-duct-tape";
import {
  generate as payloadGenerator,
  OperationDescriptor
} from "@graphitation/graphql-js-operation-payload-generator";

import { GraphQLTaggedNode } from "@nova/react";

type Generate<Schema, Node> = (
  operation: OperationDescriptor<Schema, Node>,
  mockResolvers?: Parameters<typeof payloadGenerator>[1]
) => ReturnType<typeof payloadGenerator>;

export const MockPayloadGenerator: {
  /**
   * Given an operation descriptor generates a payload to satisfy the request. For details on the API see
   * {@see https://github.com/microsoft/graphitation/tree/main/packages/graphql-js-operation-payload-generator}
   */
  generate: Generate<unknown, GraphQLTaggedNode>;
} = {
  generate: payloadGenerator as Generate<any, any>
};

/**
 * Exported only for testing purposes. Use `createMockEnvironment()` instead.
 */
export function _createMockEnvironmentWithSchema(
  schema: GraphQLSchema
): NovaMockEnvironment {
  const client = createMockClient(schema);
  const env: NovaMockEnvironment = {
    commanding: {
      trigger: jest.fn()
    },
    graphql: {
      ...GraphQLHooks,
      mock: client.mock as MockFunctions<any, any>
    },
    providerWrapper: ({ children }) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    )
  };
  return env;
}

let SCHEMA: GraphQLSchema | null = null;

/**
 * Creates a Nova environment object that can be used with the NovaFacadeProvider per usual, but has mocks instantiated
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
     <NovaFacadeProvider environment={environment}>
       <SomeTestSubject />
     </NovaFacadeProvider>
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
export function createMockEnvironment() {
  if (SCHEMA === null) {
    // TODO: This should eventually use the 1GQL shared schema.
    // https://domoreexp.visualstudio.com/MSTeams/_workitems/edit/1763201
    SCHEMA = buildClientSchema(
      require("@msteams/data-schema/generated/server-schema.json")
    );
  }
  return _createMockEnvironmentWithSchema(SCHEMA);
}

function getOperationDefinition(
  operation: OperationDescriptor<unknown, GraphQLTaggedNode>
) {
  const definition = _getOperationDefinition(
    (operation.request.node as unknown) as DocumentNode
  );
  if (!definition) {
    throw new Error(
      "Expected operation descriptor to contain a operation definition"
    );
  }
  return definition;
}

/**
 * @param operation An operation descriptor obtained from a mock environment.
 * @returns The name of the operation.
 */
export function getOperationName(
  operation: OperationDescriptor<unknown, GraphQLTaggedNode>
) {
  const name = getOperationDefinition(operation).name?.value;
  if (!name) {
    throw new Error(
      "Expected operation descriptor to contain a named operation"
    );
  }
  return name;
}

/**
 * @param operation An operation descriptor obtained from a mock environment.
 * @returns The type of the operation.
 */
export function getOperationType(
  operation: OperationDescriptor<unknown, GraphQLTaggedNode>
): "query" | "mutation" | "subscription" {
  return getOperationDefinition(operation).operation;
}
