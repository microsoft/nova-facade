import { graphql, useLazyLoadQuery } from "@nova/react";
import { FeedbackComponent } from "./Feedback";
import * as React from "react";
import type { FeedbackContainerQuery as QueryType } from "./__generated__/FeedbackContainerQuery.graphql";

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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | undefined }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div>Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

export const FeedbackContainer = () => {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<div>Loading...</div>}>
        <FeedbackContainerInner />
      </React.Suspense>
    </ErrorBoundary>
  );
};
