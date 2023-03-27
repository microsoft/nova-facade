import { buildASTSchema } from "graphql";

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const getSchema = () => buildASTSchema(require("../schema.graphql"));
