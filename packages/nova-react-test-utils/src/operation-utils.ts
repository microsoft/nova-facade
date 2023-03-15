import { getOperationDefinition as _getOperationDefinition } from "@apollo/client/utilities";
import type { DocumentNode } from "graphql";

import type { OperationDescriptor } from "@graphitation/graphql-js-operation-payload-generator";

import type { GraphQLTaggedNode } from "@nova/react";

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
