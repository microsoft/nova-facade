/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import {
  GeneratedEventWrapper,
  NovaEventingProvider,
  ReactEventWrapper,
  useNovaEventing,
} from "./nova-eventing-provider";
import { EventWrapper, InputType, NovaEventing } from "@nova/types";

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

  it("exposes 'bubble', which calls the React event mapper and bubble functions", () => {
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
      persist: jest.fn(),
    };

    const TestPassedContextComponent: React.FC = () => {
      const facadeFromContext = useNovaEventing();
      facadeFromContext.bubble({
        event: { originator: "test", type: "test" },
        reactEvent: mockEvent,
      });
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

  describe("exposes 'generateEvent'", () => {
    interface Props {
      overrideTimestamp?: boolean;
      expectedTime: number;
      eventing: NovaEventing;
      mapper: (reactEventWrapper: ReactEventWrapper) => EventWrapper;
    }
    const TestPassedContextComponent: React.FC<Props> = (
      props: Props,
    ): React.ReactElement | null => {
      const { eventing, mapper, overrideTimestamp, expectedTime } = props;
      const facadeFromContext = useNovaEventing();
      const event = { originator: "test", type: "test" };

      let eventWrapper: GeneratedEventWrapper;

      if (overrideTimestamp) {
        eventWrapper = {
          event,
          timeStampOverride: expectedTime,
        };
      } else {
        eventWrapper = {
          event,
        };
      }

      facadeFromContext.generateEvent(eventWrapper);

      expect(eventing.bubble).toBeCalledWith({
        event,
        source: {
          inputType: InputType.programmatic,
          timeStamp: expectedTime,
        },
      });
      expect(mapper).toBeCalledTimes(0);
      return null;
    };

    it("and defaults to Date.now for event timestamp and calls the bubble function.", () => {
      expect.assertions(2);

      const eventing = {
        bubble: jest.fn(),
      } as unknown as NovaEventing;

      const mapper = jest.fn();

      const now = 1000;
      jest.spyOn(Date, "now").mockImplementation(() => now);

      render(
        <NovaEventingProvider eventing={eventing} reactEventMapper={mapper}>
          <TestPassedContextComponent
            expectedTime={now}
            eventing={eventing}
            mapper={mapper}
          />
        </NovaEventingProvider>,
      );
    });

    it("and takes an override to set the timestamp and calls the bubble function.", () => {
      expect.assertions(2);

      const eventing = {
        bubble: jest.fn(),
      } as unknown as NovaEventing;

      const mapper = jest.fn();

      const overrideTime = 9999999999;

      render(
        <NovaEventingProvider eventing={eventing} reactEventMapper={mapper}>
          <TestPassedContextComponent
            overrideTimestamp
            expectedTime={overrideTime}
            eventing={eventing}
            mapper={mapper}
          />
        </NovaEventingProvider>,
      );
    });
  });
});
