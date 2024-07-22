/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
;
import { FragmentRefs } from "@graphitation/apollo-react-relay-duct-tape";
export type FeedbackContainerQueryVariables = {
    id: string;
};
export type FeedbackContainerQueryResponse = {
    readonly feedback: {
        readonly " $fragmentRefs": FragmentRefs<"Feedback_feedbackFragment">;
    };
};
export type FeedbackContainerQuery = {
    readonly response: FeedbackContainerQueryResponse;
    readonly variables: FeedbackContainerQueryVariables;
};
