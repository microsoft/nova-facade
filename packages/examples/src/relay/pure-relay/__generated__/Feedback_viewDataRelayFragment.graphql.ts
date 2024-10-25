/**
 * @generated SignedSource<<a3830a19184e1923d46ce20a8dd79776>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Feedback_viewDataRelayFragment$data = {
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
        }
      ]
    }
  ],
  "type": "ViewData",
  "abstractKey": null
};

(node as any).hash = "d35ae7bb2414a109a9019473f35690c9";

export default node;
