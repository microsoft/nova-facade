import { graphql, useFragment, useMutation_deprecated } from "@nova/react";
import * as React from "react";
import type { FeedbackComponent_LikeMutation } from "./__generated__/FeedbackComponent_LikeMutation.graphql";
import type { Feedback_feedbackFragment$key } from "./__generated__/Feedback_feedbackFragment.graphql";

type Props = {
  feedback: Feedback_feedbackFragment$key;
};

export const Feedback_feedbackFragment = graphql`
  fragment Feedback_feedbackFragment on Feedback {
    id
    message {
      text
    }
    doesViewerLike
  }
`;

export const FeedbackComponent = (props: Props) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const feedback = useFragment(Feedback_feedbackFragment, props.feedback);
  const [like, isPending] = useMutation_deprecated<FeedbackComponent_LikeMutation>(
    graphql`
      mutation FeedbackComponent_LikeMutation($input: FeedbackLikeInput!) {
        feedbackLike(input: $input) {
          feedback {
            id
            doesViewerLike
          }
        }
      }
    `,
  );
  return (
    <div>
      {errorMessage != null && (
        <div style={{ color: "red" }}>{errorMessage}</div>
      )}
      Feedback: {feedback.message.text}
      <button
        id="likeButton"
        disabled={isPending}
        onClick={() => {
          like({
            variables: {
              input: {
                feedbackId: feedback.id,
                doesViewerLike: !feedback.doesViewerLike,
              },
            },
            optimisticResponse: {
              feedbackLike: {
                feedback: {
                  id: feedback.id,
                  doesViewerLike: !feedback.doesViewerLike,
                },
              },
            },
          }).catch(() => {
            setErrorMessage("Something went wrong");
          });
        }}
      >
        {feedback.doesViewerLike ? "Unlike" : "Like"}
      </button>
    </div>
  );
};
