import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { executePlayFunction } from "../../testing-utils/executePlayFunction";
import { prepareStoryContextForTest } from "@nova/react-test-utils";

const { Primary, Liked, LikeFailure } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should correctly propagate parameters even when multiple stories with same resolvers are rendered", async () => {
    render(<Primary />);
    render(<Liked />);
    render(<Primary />);
    const texts = await screen.findAllByText("Feedback: Feedback title");
    expect(texts).toHaveLength(3);
    expect(texts[2]).toBeInTheDocument();
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
