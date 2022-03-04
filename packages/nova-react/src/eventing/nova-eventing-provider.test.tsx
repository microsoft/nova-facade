/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import {
  NovaEventingProvider,
  useNovaEventing,
} from "./nova-eventing-provider";
import {
  NovaEventing,
} from "@nova/types";

describe(useNovaEventing, () => {
  it("throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      try {
        useNovaEventing();
      } catch (e) {
        expect((e as Error).message).toMatch(
          "Nova Eventing provider must be initialized prior to consumption!",
        );
      }
      return null;
    };

    render(<TestUndefinedContextComponent />);
  });

  it("exposes the provided implementation, and calls the provided mapper", () => {
    expect.assertions(2);

    const eventing = {
      bubble: jest.fn(),
    } as unknown as NovaEventing;

    const mapper = jest.fn();

    const mockEvent: React.SyntheticEvent = {
      target: {} as EventTarget,
      timeStamp: 123,
      type: "keydown",
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      nativeEvent: {} as Event,
      currentTarget: {} as EventTarget & Element,
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      isDefaultPrevented: jest.fn(),
      isPropagationStopped: jest.fn(),
      persist:  jest.fn()
    };


    const TestPassedContextComponent: React.FC = () => {
      const facadeFromContext = useNovaEventing();
      facadeFromContext.bubble({ event: { originator: "test", type: "test"}, reactEvent: mockEvent });
      expect(eventing.bubble).toBeCalledTimes(1);
      expect(mapper).toBeCalledTimes(1);
      return null;
    };

    render(
      <NovaEventingProvider eventing={eventing} reactEventMapper={mapper}>
        <TestPassedContextComponent />
      </NovaEventingProvider>,
    );
  });
});
