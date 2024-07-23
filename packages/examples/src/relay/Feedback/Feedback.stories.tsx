import { graphql } from "@nova/react";
import { getNovaRelayEnvironmentDecorator } from "@nova/react-test-utils";
import type { WithNovaEnvironment } from "@nova/react-test-utils/src/storybook-nova-decorator-relay";
import type { Meta, StoryObj } from "@storybook/react";
import type { TypeMap } from "../../__generated__/schema.all.interface";
import { FeedbackComponent } from "./Feedback";
import type { FeedbackStoryQuery } from "./__generated__/FeedbackStoryQuery.graphql";

const decorators = [getNovaRelayEnvironmentDecorator()];
const meta: Meta<typeof FeedbackComponent> = {
  component: FeedbackComponent,
  decorators: decorators,
};

export default meta;

export const Primary = {
  args: {
    test: "test",
  },
  parameters: {
    novaEnvironment: {
      query: graphql`
        query FeedbackStoryQuery($id: ID!) @relay_test_operation {
          feedback(id: $id) {
            id
            message {
              text
            }
            doesViewerLike
            ...Feedback_feedbackFragment
          }
        }
      `,
      getReferenceEntry: (data) => ["feedback", data?.feedback],
      resolvers: {
        Feedback: () => ({
          message: { text: "Hello, world!" },
          doesViewerLike: false,
        }),
      },
    },
  } satisfies WithNovaEnvironment<FeedbackStoryQuery, TypeMap>,
};
