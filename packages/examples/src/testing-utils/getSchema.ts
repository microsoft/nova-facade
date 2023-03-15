// function that take schema.graphql file from ../ and return GraphQLSchema object

import { buildSchema } from "graphql";

export function getSchema() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const schema = buildSchema(require("../schema.graphql"));

  return schema;
}
