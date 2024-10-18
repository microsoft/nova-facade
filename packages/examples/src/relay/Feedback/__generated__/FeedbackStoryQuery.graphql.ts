/**
 * @generated SignedSource<<ecbf088f2f06fab1604b02511fe435f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FeedbackStoryQuery$variables = {
  id: string;
};
export type FeedbackStoryQuery$data = {
  readonly feedback: {
    readonly " $fragmentSpreads": FragmentRefs<"Feedback_feedbackFragment">;
  };
};
export type FeedbackStoryQuery = {
  response: FeedbackStoryQuery$data;
  variables: FeedbackStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FeedbackStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Feedback",
        "kind": "LinkedField",
        "name": "feedback",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "Feedback_feedbackFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FeedbackStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
            "concreteType": "Message",
            "kind": "LinkedField",
            "name": "message",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "text",
                "storageKey": null
              }
            ],
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
    ]
  },
  "params": {
    "cacheID": "9f2b2d3da8559bb94587bb05eaebea93",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "feedback": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Feedback"
        },
        "feedback.doesViewerLike": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Boolean"
        },
        "feedback.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "feedback.message": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Message"
        },
        "feedback.message.text": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "FeedbackStoryQuery",
    "operationKind": "query",
    "text": "query FeedbackStoryQuery(\n  $id: ID!\n) {\n  feedback(id: $id) {\n    ...Feedback_feedbackFragment\n    id\n  }\n}\n\nfragment Feedback_feedbackFragment on Feedback {\n  id\n  message {\n    text\n  }\n  doesViewerLike\n}\n"
  }
};
})();

(node as any).hash = "1606a3603109bd11d1a32f065495d923";

export default node;
