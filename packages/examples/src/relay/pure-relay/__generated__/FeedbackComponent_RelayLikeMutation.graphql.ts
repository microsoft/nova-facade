/**
 * @generated SignedSource<<1c15be7b18f58b4ef9382754b9ba1ad7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FeedbackLikeInput = {
  doesViewerLike: boolean;
  feedbackId: string;
};
export type FeedbackComponent_RelayLikeMutation$variables = {
  input: FeedbackLikeInput;
};
export type FeedbackComponent_RelayLikeMutation$data = {
  readonly feedbackLike: {
    readonly feedback: {
      readonly doesViewerLike: boolean;
      readonly id: string;
    };
  };
};
export type FeedbackComponent_RelayLikeMutation = {
  response: FeedbackComponent_RelayLikeMutation$data;
  variables: FeedbackComponent_RelayLikeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "FeedbackLikeMutationResult",
    "kind": "LinkedField",
    "name": "feedbackLike",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Feedback",
        "kind": "LinkedField",
        "name": "feedback",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "doesViewerLike",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FeedbackComponent_RelayLikeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FeedbackComponent_RelayLikeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "968ac2c311a93d7c192457e711271381",
    "id": null,
    "metadata": {},
    "name": "FeedbackComponent_RelayLikeMutation",
    "operationKind": "mutation",
    "text": "mutation FeedbackComponent_RelayLikeMutation(\n  $input: FeedbackLikeInput!\n) {\n  feedbackLike(input: $input) {\n    feedback {\n      id\n      doesViewerLike\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "64a255c318ab3d381ce8b70966fd7c6b";

export default node;
