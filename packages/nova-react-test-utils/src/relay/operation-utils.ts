import type { OperationDescriptor } from "relay-runtime";

type OperationKind = "query" | "mutation" | "subscription";

/**
 * @param operation An operation descriptor obtained from a mock environment.
 * @returns The name of the operation.
 */
export function getRelayOperationName(operation: OperationDescriptor) {
  return operation.request.node.operation.name;
}

/**
 * @param operation An operation descriptor obtained from a mock environment.
 * @returns The type of the operation.
 */
export function getRelayOperationType(
  operation: OperationDescriptor,
): OperationKind {
  return operation.request.node.params
    .operationKind as unknown as OperationKind;
}
