/**
 * @generated SignedSource<<acdc9ca01169f7513c581072d20f30c8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Feedback_viewDataRelayFragment$data = {
  readonly likeLabel: string;
  readonly numberOfLikesLabel: string;
  readonly unlikeLabel: string;
  readonly viewDataField: string | null | undefined;
  readonly " $fragmentType": "Feedback_viewDataRelayFragment";
};
export type Feedback_viewDataRelayFragment$key = {
  readonly " $data"?: Feedback_viewDataRelayFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"Feedback_viewDataRelayFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Feedback_viewDataRelayFragment",
  "selections": [
    {
      "kind": "ClientExtension",
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
      ]
    }
  ],
  "type": "ViewData",
  "abstractKey": null
};

(node as any).hash = "803cadfd6f534eba6c419c1f3c681c73";

export default node;
