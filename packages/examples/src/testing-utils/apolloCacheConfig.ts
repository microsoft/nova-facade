import {
  type InMemoryCacheConfig,
  defaultDataIdFromObject,
} from "@apollo/client";
import {
  getPossibleTypesAndDataIdFromNode,
  typePoliciesWithGlobalObjectIdStoreKeys,
} from "@graphitation/apollo-react-relay-duct-tape";
import { schema } from "./schema";

const { possibleTypes, dataIdFromNode } =
  getPossibleTypesAndDataIdFromNode(schema);

export const cacheConfig = {
  possibleTypes,
  dataIdFromObject(responseObject, keyFieldsContext) {
    return (
      dataIdFromNode(responseObject, keyFieldsContext) ||
      defaultDataIdFromObject(responseObject, keyFieldsContext)
    );
  },
  typePolicies: typePoliciesWithGlobalObjectIdStoreKeys,
} satisfies InMemoryCacheConfig;
