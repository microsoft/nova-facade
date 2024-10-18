import { graphql, useFragment, useMutation } from "react-relay";
import * as React from "react";
import type { FeedbackComponent_RelayLikeMutation } from "./__generated__/FeedbackComponent_RelayLikeMutation.graphql";
import type { Feedback_feedbackRelayFragment$key } from "./__generated__/Feedback_feedbackRelayFragment.graphql";
import {
  useOnDeleteFeedback,
  useFeedbackTelemetry,
} from "../../events/helpers";
import type { Feedback_viewDataRelayFragment$key } from "./__generated__/Feedback_viewDataRelayFragment.graphql";

type Props = {
  feedback: Feedback_feedbackRelayFragment$key;
  viewData: Feedback_viewDataRelayFragment$key;
};

export const Feedback_feedbackRelayFragment = graphql`
  fragment Feedback_feedbackRelayFragment on Feedback {
    id
    message {
      text
    }
    doesViewerLike
  }
`;

export const Feedback_viewDataRelayFragment = graphql`
  fragment Feedback_viewDataRelayFragment on ViewData {
    viewDataField
  }
`;

export const FeedbackComponent = (props: Props) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const feedback = useFragment(Feedback_feedbackRelayFragment, props.feedback);
  const viewData = useFragment(Feedback_viewDataRelayFragment, props.viewData);
  const [like, isPending] = useMutation<FeedbackComponent_RelayLikeMutation>(
    graphql`
      mutation FeedbackComponent_RelayLikeMutation($input: FeedbackLikeInput!) {
        feedbackLike(input: $input) {
          feedback {
            id
            doesViewerLike
          }
        }
      }
    `,
  );

  const onDeleteFeedback = useOnDeleteFeedback(
    feedback.id,
    feedback.message.text,
  );

  const feedbackTelemetry = useFeedbackTelemetry();

  React.useEffect(() => {
    return () => {
      feedbackTelemetry("FeedbackComponentUnmounted");
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignItems: "start",
      }}
    >
      {errorMessage != null && (
        <div style={{ color: "red" }}>{errorMessage}</div>
      )}
      Feedback: {feedback.message.text}
      <div>{viewData.viewDataField}</div>
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
            onCompleted: (response) => {
              if (response.feedbackLike.feedback.doesViewerLike) {
                feedbackTelemetry("FeedbackLiked");
              } else {
                feedbackTelemetry("FeedbackUnliked");
              }
            },
            onError: () => {
              setErrorMessage("Something went wrong");
            },
          });
        }}
      >
        {feedback.doesViewerLike ? "Unlike" : "Like"}
      </button>
      <button onClick={onDeleteFeedback}>Delete feedback</button>
    </div>
  );
};
