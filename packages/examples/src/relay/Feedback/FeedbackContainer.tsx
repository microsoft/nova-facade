import { graphql, useLazyLoadQuery } from "@nova/react";
import { FeedbackComponent } from "./Feedback";
import * as React from "react";
import type { FeedbackContainerQuery as QueryType } from "./__generated__/FeedbackContainerQuery.graphql";
import { ErrorBoundary } from "../../shared/ErrorBoundary";

const FeedbackContainerQuery = graphql`
  query FeedbackContainerQuery($id: ID!) {
    feedback(id: $id) {
      ...Feedback_feedbackFragment
    }
  }
`;

const FeedbackContainerInner = () => {
  const { data } = useLazyLoadQuery<QueryType>(FeedbackContainerQuery, {
    id: "42",
  });
  if (data) {
    return <FeedbackComponent feedback={data.feedback} />;
  } else {
    return <div>No data</div>;
  }
};

export const FeedbackContainer = () => {
  return (
    <ErrorBoundary
      fallback={<div>There was an error</div>}
      onError={console.error}
    >
      <React.Suspense fallback={<div>Loading...</div>}>
        <FeedbackContainerInner />
      </React.Suspense>
    </ErrorBoundary>
  );
};
