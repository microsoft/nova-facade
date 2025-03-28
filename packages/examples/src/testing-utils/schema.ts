import { buildASTSchema } from "graphql";

export const schema = buildASTSchema(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("../../data/schema.graphql")
);
