/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import type {
  GeneratedEventWrapper,
  ReactEventWrapper,
  NovaReactEventing,
} from "./nova-eventing-provider";
import {
  NovaEventingProvider,
  useNovaEventing,
} from "./nova-eventing-provider";
import type { EventWrapper, NovaEventing } from "@nova/types";
import { InputType } from "@nova/types";

import * as ReactEventSourceMapper from "./react-event-source-mapper";

jest.mock("./react-event-source-mapper");

describe("useNovaEventing", () => {
  let TestComponent: React.FunctionComponent<any>;
  let eventing: NovaEventing;
  let prevWrappedEventing: NovaReactEventing;
  let eventCallback: () => void;
  const initialChildren = "initial children";
  const updatedChildren = "updated children";

  beforeEach(() => {
    jest.clearAllMocks();

    const mapEventMetadataSpy = jest.spyOn(
      ReactEventSourceMapper,
      "mapEventMetadata",
    );

    eventing = { bubble: jest.fn() };
    prevWrappedEventing = undefined as unknown as NovaReactEventing;

    TestComponent = ({ childrenText }) => {
      const wrappedEventing: NovaReactEventing = useNovaEventing();
      expect(wrappedEventing).toBeDefined();
      expect(wrappedEventing).not.toBe(eventing);
      if (prevWrappedEventing) {
        expect(prevWrappedEventing).toBe(wrappedEventing);
      }
      prevWrappedEventing = wrappedEventing;

      const eventWrapper = {} as ReactEventWrapper;
      wrappedEventing.bubble(eventWrapper);
      expect(mapEventMetadataSpy).toHaveBeenCalledWith(eventWrapper);
      expect(eventing.bubble).toHaveBeenCalled();

      eventCallback = () => {
        wrappedEventing.bubble(eventWrapper);
      };

      return <div data-testid="children">{childrenText}</div>;
    };
  });

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

  test("Takes in children and eventing props, renders children, and updates children as expected.", () => {
    const wrapper = render(
      <NovaEventingProvider
        children={<TestComponent childrenText={initialChildren} />}
        eventing={eventing}
        reactEventMapper={ReactEventSourceMapper.mapEventMetadata}
      />,
    );
    expect(wrapper.queryAllByTestId("children")[0].innerHTML).toBe(
      initialChildren,
    );

    wrapper.rerender(
      <NovaEventingProvider
        children={<TestComponent childrenText={updatedChildren} />}
        eventing={eventing}
        reactEventMapper={ReactEventSourceMapper.mapEventMetadata}
      />,
    );
    expect(wrapper.queryAllByTestId("children")[0].innerHTML).toBe(
      updatedChildren,
    );
  });

  test("Takes in children and eventing props, creates a stable wrapped NovaReactEventing instance from eventing across re-renders when children do not change.", () => {
    const stableTestComponentInstance = (
      <TestComponent childrenText={initialChildren} />
    );

    const wrapper = render(
      <NovaEventingProvider
        children={stableTestComponentInstance}
        eventing={eventing}
        reactEventMapper={ReactEventSourceMapper.mapEventMetadata}
      />,
    );
    expect(wrapper.queryAllByTestId("children")[0].innerHTML).toBe(
      initialChildren,
    );

    wrapper.rerender(
      <NovaEventingProvider
        children={stableTestComponentInstance}
        eventing={eventing}
        reactEventMapper={ReactEventSourceMapper.mapEventMetadata}
      />,
    );
    expect(wrapper.queryAllByTestId("children")[0].innerHTML).toBe(
      initialChildren,
    );

    // Update eventing instance to test useRef pathway. This will ensure the wrapped eventing instance
    // returned from useEventing is stable from one render to the next.
    const newEventing = { bubble: jest.fn() };

    wrapper.rerender(
      <NovaEventingProvider
        children={stableTestComponentInstance}
        eventing={newEventing}
        reactEventMapper={ReactEventSourceMapper.mapEventMetadata}
      />,
    );

    expect(wrapper.queryAllByTestId("children")[0].innerHTML).toBe(
      initialChildren,
    );

    //Trigger a callback on the test child through eventing
    eventCallback();

    expect(newEventing.bubble).toHaveBeenCalled();

    // Update mapper instance to test useRef pathway. This will ensure the wrapped eventing instance
    // returned from useEventing is stable from one render to the next.
    const newMapper: (reactEventWrapper: ReactEventWrapper) => EventWrapper =
      jest.fn();

    wrapper.rerender(
      <NovaEventingProvider
        children={stableTestComponentInstance}
        eventing={newEventing}
        reactEventMapper={newMapper}
      />,
    );

    expect(wrapper.queryAllByTestId("children")[0].innerHTML).toBe(
      initialChildren,
    );

    //Trigger a callback on the test child through eventing
    eventCallback();

    expect(newMapper).toHaveBeenCalled();
  });
});

describe("NovaReactEventing exposes 'generateEvent'", () => {
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
