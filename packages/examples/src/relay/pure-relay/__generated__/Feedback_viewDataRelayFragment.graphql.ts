/**
 * @generated SignedSource<<aee1bd0a8dee1a323da7dd772799d9ba>>
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
        }
      ]
    }
  ],
  "type": "ViewData",
  "abstractKey": null
};

(node as any).hash = "bd429e7ff49487371eade969c3b2f56b";

export default node;
