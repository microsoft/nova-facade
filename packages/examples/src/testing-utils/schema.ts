import { buildASTSchema } from "graphql";
import schemaGraphql from "../../data/schema.graphql";

export const schema = buildASTSchema(schemaGraphql);
