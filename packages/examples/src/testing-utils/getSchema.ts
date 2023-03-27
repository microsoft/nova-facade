import { buildASTSchema } from "graphql";
import * as schema from "../schema.graphql";

export const getSchema = () => buildASTSchema(schema);
