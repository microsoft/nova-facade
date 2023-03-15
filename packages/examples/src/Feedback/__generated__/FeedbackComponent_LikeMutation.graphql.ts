/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
;
export type FeedbackLikeInput = {
    feedbackId: string;
    doesViewerLike: boolean;
};
export type FeedbackComponent_LikeMutationVariables = {
    input: FeedbackLikeInput;
};
export type FeedbackComponent_LikeMutationResponse = {
    readonly feedbackLike: {
        readonly feedback: {
            readonly id: string;
            readonly doesViewerLike: boolean;
        };
    };
};
export type FeedbackComponent_LikeMutation = {
    readonly response: FeedbackComponent_LikeMutationResponse;
    readonly variables: FeedbackComponent_LikeMutationVariables;
};
