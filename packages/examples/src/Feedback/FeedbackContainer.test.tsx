import { composeStories } from "@storybook/react";
import * as stories from "./FeedbackContainer.stories";
import { FeedbackContainer } from "./FeedbackContainer";
import { act, render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import {
  createMockEnvironment,
  getOperationName,
  MockPayloadGenerator,
  NovaMockEnvironmentProvider,
} from "@nova/react-test-utils";
import { getSchema } from "../testing-utils/getSchema";

const { Primary, Liked } = composeStories(stories);

describe("FeedbackContainer", () => {
  it("should show like button", async () => {
    render(<Primary />);
    const button = await screen.findByRole("button", { name: "Like" });
    expect(button).toBeInTheDocument();
  });

  it("should show unlike button", async () => {
    render(<Liked />);
    const button = await screen.findByRole("button", { name: "Unlike" });
    expect(button).toBeInTheDocument();
  });

  it("should show unlike when used directly", async () => {
    const environment = createMockEnvironment(getSchema());
    render(<FeedbackContainer />, {
      wrapper: ({ children }) => {
        return (
          <NovaMockEnvironmentProvider environment={environment}>
            {children}
          </NovaMockEnvironmentProvider>
        );
      },
    });
    await act(async () =>
      environment.graphql.mock.resolveMostRecentOperation((operation) => {
        console.log(getOperationName(operation))
        return MockPayloadGenerator.generate(operation, {
          Feedback: () => ({
            id: "1",
            doesViewerLike: true,
            message: {
              text: "Some text",
            },
          }),
        });
      }),
    );

    const button = await screen.findByRole("button", { name: "Unlike" });
    expect(button).toBeInTheDocument();
  });
});
