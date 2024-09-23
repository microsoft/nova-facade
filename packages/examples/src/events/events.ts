import type { NovaEvent } from "@nova/types";

type DeleteFeedbackRequest = {
  feedbackId: string;
  feedbackText: string;
};

type FeedbackTelemetryRequest = {
  operation: "FeedbackLiked" | "FeedbackUnliked" | "FeedbackComponentUnmounted";
};

export const originator = "Feedback" as const;
export const eventTypes = {
  onDeleteFeedback: "onDeleteFeedback",
  feedbackTelemetry: "feedbackTelemetry",
} as const;

export interface DeleteFeedbackEvent extends NovaEvent<DeleteFeedbackRequest> {
  originator: typeof originator;
  type: typeof eventTypes.onDeleteFeedback;
  data: () => DeleteFeedbackRequest;
}

export interface FeedbackTelemetryEvent
  extends NovaEvent<FeedbackTelemetryRequest> {
  originator: typeof originator;
  type: typeof eventTypes.feedbackTelemetry;
  data: () => FeedbackTelemetryRequest;
}

export const events = {
  onDeleteFeedback: (data: DeleteFeedbackRequest): DeleteFeedbackEvent => ({
    originator,
    type: eventTypes.onDeleteFeedback,
    data: () => data,
  }),
  feedbackTelemetry: (
    data: FeedbackTelemetryRequest,
  ): FeedbackTelemetryEvent => ({
    originator,
    type: eventTypes.feedbackTelemetry,
    data: () => data,
  }),
};
