import { composeStories } from "@storybook/react";
import * as stories from "./Feedback.stories";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { executePlayFunction } from "../../testing-utils/executePlayFunction";
import { prepareStoryContextForTest } from "@nova/react-test-utils/relay";
import type { NovaEventing, EventWrapper } from "@nova/types";

const {
  ArtificialFailureToShowcaseDecoratorBehaviorInCaseOfADevCausedError,
  LikeFailure,
  Primary,
} = composeStories(stories);

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

describe("Feedback", () => {
  it("rerenders without unmounting", async () => {
    const { rerender, findByRole } = render(<Primary />);
    await findByRole("button", { name: "Like" });

    let telemetryEvents = generateEventMock.mock.calls.filter(
      ([{ event }]) => event.type === "feedbackTelemetry",
    );

    expect(telemetryEvents).toHaveLength(1); // coming from strict mode

    rerender(<Primary />);
    await findByRole("button", { name: "Like" });

    telemetryEvents = generateEventMock.mock.calls.filter(
      ([{ event }]) => event.type === "feedbackTelemetry",
    );
    expect(telemetryEvents).toHaveLength(1); // there are no remounts of the component on Story rerender
  });
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
