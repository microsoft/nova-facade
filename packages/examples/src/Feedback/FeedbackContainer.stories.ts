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
        Feedback: () => sampleFeedback,
      },
    },
  },
};

export const Liked: Story & {
  parameters: NovaEnvironmentDecoratorParameters<TypeMap>;
} = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => ({
          ...sampleFeedback,
          doesViewerLike: true,
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
        Feedback: () => sampleFeedback,
        FeedbackLikeMutationResult: () => ({
          feedback: {
            ...sampleFeedback,
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

// TODO get this to work
export const LikeFailure: Story & {
  parameters: NovaEnvironmentDecoratorParameters<TypeMap>;
} = {
  parameters: {
    novaEnvironment: {
      resolvers: {
        Feedback: () => sampleFeedback,
        // FeedbackLikeMutationResult: () => new Error("Like failed"),
      },
    },
  },
  play: Like.play,
};

const sampleFeedback = {
  id: "42",
  message: {
    text: "Feedback title",
  },
  doesViewerLike: false,
};
