import { composeStories } from "@storybook/react";
import * as stories from "./Feedback.stories";
import { render } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { prepareStoryContextForTest } from "@nova/react-test-utils/apollo";
import { executePlayFunction } from "../../testing-utils/executePlayFunction";
import type { EventWrapper, NovaEventing } from "@nova/types";

const {
  ArtificialFailureToShowcaseDecoratorBehaviorInCaseOfADevCausedError,
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
