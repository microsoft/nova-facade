/**
 * @generated SignedSource<<9e8cbc821d04a9dc43d1118707b7cece>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type FeedbackLikeInput = {
  doesViewerLike: boolean;
  feedbackId: string;
};
export type FeedbackComponent_LikeMutation$variables = {
  input: FeedbackLikeInput;
};
export type FeedbackComponent_LikeMutation$data = {
  readonly feedbackLike: {
    readonly feedback: {
      readonly doesViewerLike: boolean;
      readonly id: string;
    };
  };
};
export type FeedbackComponent_LikeMutation = {
  response: FeedbackComponent_LikeMutation$data;
  variables: FeedbackComponent_LikeMutation$variables;
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
    "name": "FeedbackComponent_LikeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FeedbackComponent_LikeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ae7b915bd05c2d0ca3c1fd92452532df",
    "id": null,
    "metadata": {},
    "name": "FeedbackComponent_LikeMutation",
    "operationKind": "mutation",
    "text": "mutation FeedbackComponent_LikeMutation(\n  $input: FeedbackLikeInput!\n) {\n  feedbackLike(input: $input) {\n    feedback {\n      id\n      doesViewerLike\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "44346c07761fcc5e38033805947f6ea7";

export default node;
