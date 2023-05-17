import { graphql, useLazyLoadQuery } from "@nova/react";
import { FeedbackComponent, Feedback_feedbackFragment } from "./Feedback";
import * as React from "react";
import type { FeedbackContainerQuery as QueryType } from "./__generated__/FeedbackContainerQuery.graphql";

const FeedbackContainerQuery = graphql`
  query FeedbackContainerQuery($id: ID!) {
    feedback(id: $id) {
      ...Feedback_feedbackFragment
    }
  }
  ${Feedback_feedbackFragment}
`;

export const FeedbackContainer = () => {
  const { data, error } = useLazyLoadQuery<QueryType>(FeedbackContainerQuery, {
    id: "42",
  });
  if (data) {
    return <FeedbackComponent feedback={data.feedback} />;
  } else {
    if (!error) {
      return <div>Loading...</div>;
    } else {
      return <div>Error: {error.message}</div>;
    }
  }
};
