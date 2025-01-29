import { buildASTSchema } from "graphql";

export const getSchema = () =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  buildASTSchema(require("../../data/schema.graphql"));
