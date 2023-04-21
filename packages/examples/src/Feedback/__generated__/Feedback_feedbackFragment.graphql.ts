/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
;
import { FragmentRefs } from "@graphitation/apollo-react-relay-duct-tape";
export type Feedback_feedbackFragment = {
    readonly id: string;
    readonly message: {
        readonly text: string;
    };
    readonly doesViewerLike: boolean;
    readonly " $refType": "Feedback_feedbackFragment";
};
export type Feedback_feedbackFragment$data = Feedback_feedbackFragment;
export type Feedback_feedbackFragment$key = {
    readonly " $data"?: Feedback_feedbackFragment$data | undefined;
    readonly " $fragmentRefs": FragmentRefs<"Feedback_feedbackFragment">;
};
