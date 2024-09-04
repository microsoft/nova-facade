/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
;
import { FragmentRefs } from "@graphitation/apollo-react-relay-duct-tape";
export type FeedbackStoryQueryVariables = {
    id: string;
};
export type FeedbackStoryQueryResponse = {
    readonly feedback: {
        readonly " $fragmentRefs": FragmentRefs<"Feedback_feedbackFragment">;
    };
};
export type FeedbackStoryQuery = {
    readonly response: FeedbackStoryQueryResponse;
    readonly variables: FeedbackStoryQueryVariables;
};
