import { composeStories } from "@storybook/react";
import * as stories from "./Feedback.stories";
import { render } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { executePlayFunction } from "../../testing-utils/executePlayFunction";
import { prepareStoryContextForTest } from "@nova/react-test-utils/relay";

const { ArtificialFailureToShowcaseDecoratorBehaviorInCaseOfADevCausedError } =
  composeStories(stories);

describe("Feedback", () => {
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
