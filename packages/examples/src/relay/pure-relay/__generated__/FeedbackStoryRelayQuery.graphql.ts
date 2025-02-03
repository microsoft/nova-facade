/**
 * @generated SignedSource<<eb997f8935f1e6f8cca5a15b2f22a8d2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FeedbackStoryRelayQuery$variables = {
  id: string;
};
export type FeedbackStoryRelayQuery$data = {
  readonly feedback: {
    readonly " $fragmentSpreads": FragmentRefs<"Feedback_feedbackRelayFragment">;
  };
  readonly viewData: {
    readonly " $fragmentSpreads": FragmentRefs<"Feedback_viewDataRelayFragment">;
  } | null | undefined;
};
export type FeedbackStoryRelayQuery = {
  response: FeedbackStoryRelayQuery$data;
  variables: FeedbackStoryRelayQuery$variables;
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
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FeedbackStoryRelayQuery",
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
            "name": "Feedback_feedbackRelayFragment"
          }
        ],
        "storageKey": null
      },
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ViewData",
            "kind": "LinkedField",
            "name": "viewData",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "Feedback_viewDataRelayFragment"
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FeedbackStoryRelayQuery",
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
      },
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ViewData",
            "kind": "LinkedField",
            "name": "viewData",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewDataField",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "likeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "unlikeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "numberOfLikesLabel",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "3a00fb452776d7d61323755d1f81e58f",
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
        "feedback.message.text": (v2/*: any*/),
        "viewData": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ViewData"
        },
        "viewData.likeLabel": (v2/*: any*/),
        "viewData.numberOfLikesLabel": (v2/*: any*/),
        "viewData.unlikeLabel": (v2/*: any*/),
        "viewData.viewDataField": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "FeedbackStoryRelayQuery",
    "operationKind": "query",
    "text": "query FeedbackStoryRelayQuery(\n  $id: ID!\n) {\n  feedback(id: $id) {\n    ...Feedback_feedbackRelayFragment\n    id\n  }\n}\n\nfragment Feedback_feedbackRelayFragment on Feedback {\n  id\n  message {\n    text\n  }\n  doesViewerLike\n}\n"
  }
};
})();

(node as any).hash = "87e89c4f3d23c32eb214ba7503cdd52d";

export default node;
