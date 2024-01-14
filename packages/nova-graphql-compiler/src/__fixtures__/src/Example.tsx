import { graphql } from "@nova/react";

graphql`
  fragment Example_feedbackFragment on Feedback {
    id
    message {
      text
    }
    doesViewerLike
  }
`;
