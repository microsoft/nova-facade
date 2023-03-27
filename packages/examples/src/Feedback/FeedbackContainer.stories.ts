import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import { FeedbackContainer } from "./FeedbackContainer";
import type { NovaEnvironmentDecoratorParameters } from "@nova/react-test-utils";
import { getNovaEnvironmentDecorator } from "@nova/react-test-utils";
import { getSchema } from "../testing-utils/getSchema";
import type { TypeMap } from "../__generated__/schema.all.interface";

const schema = getSchema();

const meta: Meta<typeof FeedbackContainer> = {
  component: FeedbackContainer,
  decorators: [getNovaEnvironmentDecorator(schema)],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story & {
  parameters: NovaEnvironmentDecoratorParameters<TypeMap>;
} = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => ({
          id: "42",
          message: {
            text: "Feedback title",
          },
          doesViewerLike: false,
        }),
      },
    },
  },
};

export const Like: Story & {
  parameters: NovaEnvironmentDecoratorParameters<TypeMap>;
} = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => ({
          id: "42",
          message: {
            text: "Feedback title",
          },
          doesViewerLike: false,
        }),
        FeedbackLikeMutationResult: () => ({
          feedback: {
            id: "42",
            message: {
              text: "Feedback title",
            },
            doesViewerLike: true,
          },
        }),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const container = within(canvasElement);
    const likeButton = await container.findByRole("button", { name: "Like" });
    userEvent.click(likeButton);
  },
};
