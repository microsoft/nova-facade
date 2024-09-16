import * as React from "react";
import type { NovaMockEnvironment } from "../shared/nova-mock-environment";
import { type GraphQLSchema, parse as parseGraphQL } from "graphql";
import {
  type MockResolvers,
  generate as payloadGenerator,
} from "@graphitation/graphql-js-operation-payload-generator";
import type { OperationDescriptor as RelayOperationDescriptor } from "relay-runtime";
import { novaGraphql } from "./nova-relay-graphql";
import { createMockEnvironment } from "relay-test-utils";
import { RelayEnvironmentProvider } from "react-relay";
import { jest } from "@jest/globals";

export class RelayMockPayloadGenerator {
  public gqlSchema: GraphQLSchema;

  constructor(gqlSchema: GraphQLSchema) {
    this.gqlSchema = gqlSchema;
  }

  public generate(
    operation: RelayOperationDescriptor,
    mockResolvers?: MockResolvers,
    generateId?: () => number,
  ): ReturnType<typeof payloadGenerator> {
    if (!operation.request.node.params.text) {
      throw new Error("Expected operation descriptor to have operation text");
    }
    const { data } = payloadGenerator(
      {
        schema: this.gqlSchema,
        request: {
          variables: operation.request.variables,
          node: parseGraphQL(operation.request.node.params.text),
        },
      },
      mockResolvers,
      false,
      generateId,
    );
    // Create a copy of the data which creates objects with prototypes,
    // because graphql-js doesn't do this and it makes it impossible for
    // relay to use Object.prototype methods on the data.
    return { data: JSON.parse(JSON.stringify(data)) };
  }
}

type RelayEnvironmentOptions = Parameters<typeof createMockEnvironment>[0];

/**
 * Creates a Nova environment object that can be used with the NovaMockEnvironmentProvider and has mocks instantiated
 * for each piece of the facade interface. Check README for details.
 */
export function createNovaRelayMockEnvironment(
  options?: RelayEnvironmentOptions,
) {
  const relayEnvironment = createMockEnvironment(options);
  const env: NovaMockEnvironment<"relay", "test"> = {
    commanding: {
      trigger: jest.fn(),
    },
    eventing: {
      bubble: jest.fn(),
    },
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
  };
  return env;
}
