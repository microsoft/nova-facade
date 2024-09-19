import { composeStories } from "@storybook/react";
import * as stories from "./Feedback.stories";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { executePlayFunction } from "../../testing-utils/executePlayFunction";
import { prepareStoryContextForTest } from "@nova/react-test-utils/relay";

const {
  ArtificialFailureToShowcaseDecoratorBehaviorInCaseOfADevCausedError,
  LikeFailure,
} = composeStories(stories);

describe("Feedback", () => {
  it("should show an error if the like button fails", async () => {
    const { container } = render(<LikeFailure />);
    await executePlayFunction(
      LikeFailure,
      prepareStoryContextForTest(LikeFailure, container),
    );
    const error = await screen.findByText("Something went wrong");
    expect(error).toBeInTheDocument();
  });
  it("throws an error when the developer makes a mistake", async () => {
    const { container } = render(
      <ArtificialFailureToShowcaseDecoratorBehaviorInCaseOfADevCausedError />,
    );
    const context = prepareStoryContextForTest(
      ArtificialFailureToShowcaseDecoratorBehaviorInCaseOfADevCausedError,
      container,
    );
    expect(async () => {
      await executePlayFunction(
        ArtificialFailureToShowcaseDecoratorBehaviorInCaseOfADevCausedError,
        context,
      );
    }).rejects.toThrowError("Query failed");
  });
});
