/**
 * @generated SignedSource<<857e369af95fed51d17a8de7c72bbc62>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Feedback_feedbackRelayFragment$data = {
  readonly doesViewerLike: boolean;
  readonly id: string;
  readonly message: {
    readonly text: string;
  };
  readonly " $fragmentType": "Feedback_feedbackRelayFragment";
};
export type Feedback_feedbackRelayFragment$key = {
  readonly " $data"?: Feedback_feedbackRelayFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"Feedback_feedbackRelayFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Feedback_feedbackRelayFragment",
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

(node as any).hash = "489883dd98e3f989898f778ed38f10ea";

export default node;
