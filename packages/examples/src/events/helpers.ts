import { useNovaEventing } from "@nova/react";
import { useCallback } from "react";
import { events } from "./events";

export const useOnDeleteFeedback = (
  feedbackId: string,
  feedbackText: string,
) => {
  const eventing = useNovaEventing();

  return useCallback(
    (reactEvent: React.SyntheticEvent) => {
      const event = events.onDeleteFeedback({ feedbackId, feedbackText });
      void eventing.bubble({ event, reactEvent });
    },
    [eventing, feedbackId, feedbackText],
  );
};

export const useFeedbackTelemetry = () => {
  const eventing = useNovaEventing();

  return useCallback(
    (
      operation:
        | "FeedbackLiked"
        | "FeedbackUnliked"
        | "FeedbackComponentUnmounted",
    ) => {
      const event = events.feedbackTelemetry({ operation });
      void eventing.generateEvent({ event });
    },
    [eventing],
  );
};
