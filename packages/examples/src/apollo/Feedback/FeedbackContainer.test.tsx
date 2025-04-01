import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import type { NovaEventing, EventWrapper } from "@nova/types";
import { prepareStoryContextForTest } from "@nova/react-test-utils/apollo";
import { executePlayFunction } from "../../testing-utils/executePlayFunction";

const bubbleMock = jest.fn<NovaEventing, [EventWrapper]>();
const generateEventMock = jest.fn<NovaEventing, [EventWrapper]>();

jest.mock("@nova/react", () => ({
  ...jest.requireActual("@nova/react"),
  useNovaEventing: () => ({
    bubble: bubbleMock,
    generateEvent: generateEventMock,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const { Primary, Liked, LikeFailure } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should correctly propagate parameters even when multiple stories with same resolvers are rendered", async () => {
    render(<Primary />);
    render(<Liked />);
    render(<Primary />);
    const text = "Feedback: Feedback title";
    await waitFor(
      () => {
        const texts = screen.getAllByText(text);
        expect(texts).toHaveLength(3);
      },
      { timeout: 3000 },
    );
    expect(screen.getAllByText(text)[2]).toBeInTheDocument();
  });

  // kept in jest to ensure prepareStoryContextForTest works correctly
  it("should show an error if the like button fails", async () => {
    const { container } = render(<LikeFailure />);
    await executePlayFunction(
      LikeFailure,
      prepareStoryContextForTest(LikeFailure, container),
    );
    const error = await screen.findByText("Something went wrong");
    expect(error).toBeInTheDocument();
  });
});
