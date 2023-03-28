import { graphql, useFragment, useMutation } from "@nova/react";
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
    __typename
  }
`;

export const FeedbackComponent = (props: Props) => {
  //   const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const feedback = useFragment(Feedback_feedbackFragment, props.feedback);
  const [like, isPending] = useMutation<FeedbackComponent_LikeMutation>(
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

  // {
  //     optimisticResponse: {
  //       feedbackLike: {
  //         __typename: "FeedbackLikeResponsePayload",
  //         feedback: {
  //           __typename: "Feedback",
  //           id: props.feedback.id,
  //           doesViewerLike: true,
  //         },
  //       },
  //     },
  //   });
  console.log({ like, isPending });
  return (
    <div>
      {/* TODO: handle setting message from mutation depending on it success state */}
      {/* {errorMessage != null && <span id="errorMessage">{errorMessage}</span>} */}
      Feedback: {feedback?.message?.text}
      <button
        id="likeButton"
        disabled={isPending}
        onClick={() => {
          like({
            variables: {
              input: {
                feedbackId: feedback?.id ?? "42",
                doesViewerLike: !feedback?.doesViewerLike,
              },
            },
            optimisticResponse: {
              feedbackLike: {
                feedback: {
                  id: feedback?.id ?? "42",
                  doesViewerLike: !feedback?.doesViewerLike,
                },
              },
            },
          });
        }}
      >
        {feedback.doesViewerLike ? "Unlike" : "Like"}
      </button>
    </div>
  );
};
