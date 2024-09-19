import { graphql, useFragment, useMutation } from "react-relay";
import { useNovaEventing } from "@nova/react";
import * as React from "react";
import type { FeedbackComponent_RelayLikeMutation } from "./__generated__/FeedbackComponent_RelayLikeMutation.graphql";
import type { Feedback_feedbackRelayFragment$key } from "./__generated__/Feedback_feedbackRelayFragment.graphql";
import { events } from "../../events/events";

type Props = {
  feedback: Feedback_feedbackRelayFragment$key;
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

export const FeedbackComponent = (props: Props) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const feedback = useFragment(Feedback_feedbackRelayFragment, props.feedback);
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

const useOnDeleteFeedback = (feedbackId: string, feedbackText: string) => {
  const eventing = useNovaEventing();

  return React.useCallback(
    (reactEvent: React.SyntheticEvent) => {
      const event = events.onDeleteFeedback({ feedbackId, feedbackText });
      void eventing.bubble({ event, reactEvent });
    },
    [eventing, feedbackId, feedbackText],
  );
};

const useFeedbackTelemetry = () => {
  const eventing = useNovaEventing();

  return React.useCallback(
    (operation: "FeedbackLiked" | "FeedbackUnliked") => {
      const event = events.feedbackTelemetry({ operation });
      void eventing.generateEvent({ event });
    },
    [eventing],
  );
};
