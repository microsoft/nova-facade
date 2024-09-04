/**
 * @generated SignedSource<<9a9e9576834b9673626fc27f4e27f924>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Feedback_feedbackFragment$data = {
  readonly doesViewerLike: boolean;
  readonly id: string;
  readonly message: {
    readonly text: string;
  };
  readonly " $fragmentType": "Feedback_feedbackFragment";
};
export type Feedback_feedbackFragment$key = {
  readonly " $data"?: Feedback_feedbackFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"Feedback_feedbackFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Feedback_feedbackFragment",
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
  "type": "Feedback",
  "abstractKey": null
};

(node as any).hash = "915fb8b72e1f5721b2a76d1865938a94";

export default node;
