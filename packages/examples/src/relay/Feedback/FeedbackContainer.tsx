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
  {
    children: React.ReactNode;
    onError?: (error: Error) => void;
    fallback?: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  public componentDidCatch(error: Error): void {
    this.props.onError?.(error);
    this.setState({ hasError: true });
  }

  public static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div>Error!</div>;
    }
    return this.props.children;
  }
}

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
