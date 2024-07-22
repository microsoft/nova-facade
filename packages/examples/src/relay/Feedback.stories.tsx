import { graphql } from "@nova/react";
import { getNovaRelayEnvironmentDecorator } from "@nova/react-test-utils";
import type { WithNovaEnvironment } from "@nova/react-test-utils/src/storybook-nova-decorator-relay";
import type { Meta, StoryObj } from "@storybook/react";
import type { TypeMap } from "../__generated__/schema.all.interface";
import { FeedbackComponent } from "./Feedback/Feedback";
import type { FeedbackStoryQuery } from "./__generated__/FeedbackStoryQuery.graphql";

const meta: Meta<typeof FeedbackComponent> = {
  component: FeedbackComponent,
  decorators: [getNovaRelayEnvironmentDecorator()],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  decorators: [getNovaRelayEnvironmentDecorator()],
  parameters: {
    novaEnvironment: {
      query: graphql`
        query FeedbackStoryQuery($id: ID!) @relay_test_operation {
          feedback(id: $id) {
            ...Feedback_feedbackFragment
          }
        }
      `,
      getReferenceEntry: (data) => ["feedback", data?.feedback],
    },
  } satisfies WithNovaEnvironment<FeedbackStoryQuery, TypeMap>,
};
