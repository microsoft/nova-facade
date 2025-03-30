import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { prepareStoryContextForTest } from "@nova/react-test-utils/apollo";
import { executePlayFunction } from "../../testing-utils/executePlayFunction";
import type { NovaEventing, EventWrapper } from "@nova/types";
import { eventTypes, type FeedbackTelemetryEvent } from "../../events/events";

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

const { Primary, Liked, Like } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should show unlike button after clicking like button and send telemetry event", async () => {
    const { container } = render(<Like />);
    await executePlayFunction(
      Like,
      prepareStoryContextForTest(Like, container),
    );
    const button = await screen.findByRole("button", { name: "Unlike" });
    expect(button).toBeInTheDocument();

    const telemetryEvents = generateEventMock.mock.calls
      .filter(([{ event }]) => event.type === eventTypes.feedbackTelemetry)
      .map(([{ event }]) => event as FeedbackTelemetryEvent);

    const unlikeEvents = telemetryEvents.filter(
      (event) => event.data?.().operation === "FeedbackLiked",
    );

    expect(unlikeEvents).toHaveLength(1);
  });
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
});
