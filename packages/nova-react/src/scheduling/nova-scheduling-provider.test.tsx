/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import {
  NovaSchedulingProvider,
  useNovaScheduling,
} from "./nova-scheduling-provider";
import type { NovaScheduling } from "@nova/types";

describe(useNovaScheduling, () => {
  it("throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      try {
        useNovaScheduling();
      } catch (e) {
        expect((e as Error).message).toMatch(
          "Nova scheduling provider must be initialized prior to consumption!",
        );
      }
      return null;
    };

    render(<TestUndefinedContextComponent />);
  });

  it("is able to access the scheduling instance provided by the provider", () => {
    expect.assertions(2);

    const scheduling = {
      schedule: jest.fn(),
      cancel: jest.fn(),
    } as unknown as NovaScheduling;

    const TestPassedContextComponent: React.FC = () => {
      const facadeFromContext = useNovaScheduling();
      expect(facadeFromContext).toBe(scheduling);
      facadeFromContext.schedule(
        () => {
          return;
        },
        { priority: "background", scheduledById: "test", id: "test" },
      );
      expect(scheduling.schedule).toBeCalledTimes(1);
      return null;
    };

    render(
      <NovaSchedulingProvider scheduling={scheduling}>
        <TestPassedContextComponent />
      </NovaSchedulingProvider>,
    );
  });
});
