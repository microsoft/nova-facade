/**
 * @generated SignedSource<<07d4482358adb64475d9f60bf3725690>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FeedbackStoryQuery$variables = {
  id: string;
};
export type FeedbackStoryQuery$data = {
  readonly feedback: {
    readonly doesViewerLike: boolean;
    readonly id: string;
    readonly message: {
      readonly text: string;
    };
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
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "doesViewerLike",
  "storageKey": null
};
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
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
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
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ee3e9a301513b1739b2d313ae135afe0",
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
    "text": "query FeedbackStoryQuery(\n  $id: ID!\n) {\n  feedback(id: $id) {\n    id\n    message {\n      text\n    }\n    doesViewerLike\n    ...Feedback_feedbackFragment\n  }\n}\n\nfragment Feedback_feedbackFragment on Feedback {\n  id\n  message {\n    text\n  }\n  doesViewerLike\n}\n"
  }
};
})();

(node as any).hash = "99ec68e7b8ed25e75db2f19f6e233ec9";

export default node;
