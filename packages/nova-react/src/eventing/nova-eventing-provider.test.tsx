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
  useNovaUnmountEventing,
} from "./nova-eventing-provider";
import type { EventWrapper, NovaEventing, Source } from "@nova/types";
import { InputType } from "@nova/types";

import * as ReactEventSourceMapper from "./react-event-source-mapper";

const { useEffect } = React;

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

  it("useNovaEventing throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      try {
        useNovaEventing();
      } catch (e) {
        expect((e as Error).message).toMatch(
          "Nova Eventing provider must be initialized prior to consumption of eventing!",
        );
      }
      return null;
    };

    render(<TestUndefinedContextComponent />);
  });

  it("useNovaUnmountEventing throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      try {
        useNovaUnmountEventing();
      } catch (e) {
        expect((e as Error).message).toMatch(
          "Nova Eventing provider must be initialized prior to consumption of unmountEventing!",
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
    overrideSource?: Source;
    expectedTime: number;
    eventing: NovaEventing;
    mapper: (reactEventWrapper: ReactEventWrapper) => EventWrapper;
  }
  const TestPassedContextComponent: React.FC<Props> = (
    props: Props,
  ): React.ReactElement | null => {
    const {
      eventing,
      mapper,
      overrideTimestamp,
      expectedTime,
      overrideSource,
    } = props;
    const facadeFromContext = useNovaEventing();
    const event = { originator: "test", type: "test" };

    let eventWrapper: GeneratedEventWrapper;

    if (overrideTimestamp) {
      eventWrapper = {
        event,
        timeStampOverride: expectedTime,
      };
    } else if (overrideSource) {
      eventWrapper = {
        event,
        source: overrideSource,
      };
    } else {
      eventWrapper = {
        event,
      };
    }

    facadeFromContext.generateEvent(eventWrapper);

    expect(eventing.bubble).toBeCalledWith({
      event,
      source: overrideSource ?? {
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

  it("and takes an override to set the source and calls the bubble function.", () => {
    expect.assertions(2);

    const eventing = {
      bubble: jest.fn(),
    } as unknown as NovaEventing;

    const mapper = jest.fn();

    const overrideTime = 9999999999;
    const overrideSource = {
      inputType: InputType.keyboard,
      timeStamp: overrideTime,
    };

    render(
      <NovaEventingProvider eventing={eventing} reactEventMapper={mapper}>
        <TestPassedContextComponent
          overrideSource={overrideSource}
          expectedTime={overrideTime}
          eventing={eventing}
          mapper={mapper}
        />
      </NovaEventingProvider>,
    );
  });
});

describe("useUnmountEventing", () => {
  it("falls back to eventing instance when unmountEventing is not provided", () => {
    const eventing = {
      bubble: jest.fn(),
    } as unknown as NovaEventing;

    const mapper = jest.fn();

    const TestPassedContextComponent: React.FC =
      (): React.ReactElement | null => {
        const unmountEventing = useNovaUnmountEventing();
        expect(unmountEventing).toBeDefined();

        unmountEventing.bubble({} as ReactEventWrapper);

        expect(eventing.bubble).toHaveBeenCalled();
        return null;
      };

    render(
      <NovaEventingProvider eventing={eventing} reactEventMapper={mapper}>
        <TestPassedContextComponent />
      </NovaEventingProvider>,
    );
  });

  it('calls "bubble" on the unmountEventing instance when provided', () => {
    const eventing = {
      bubble: jest.fn(),
    } as unknown as NovaEventing;

    const unmountEventingMock = {
      bubble: jest.fn(),
    } as unknown as NovaEventing;

    const mapper = jest.fn();

    const TestPassedContextComponent: React.FC =
      (): React.ReactElement | null => {
        const unmountEventing = useNovaUnmountEventing();
        expect(unmountEventing).toBeDefined();

        unmountEventing.bubble({} as ReactEventWrapper);

        expect(unmountEventingMock.bubble).toHaveBeenCalled();
        return null;
      };

    render(
      <NovaEventingProvider
        eventing={eventing}
        unmountEventing={unmountEventingMock}
        reactEventMapper={mapper}
      >
        <TestPassedContextComponent />
      </NovaEventingProvider>,
    );
  });

  it("calls the unmounting eventing instance when the component calls unmounting through a useEffect cleanup event", () => {
    const eventing = {
      bubble: jest.fn(),
    } as unknown as NovaEventing;
    const unmountEventingMock = {
      bubble: jest.fn(),
    } as unknown as NovaEventing;

    const mapper = jest.fn();

    const TestPassedContextComponent: React.FC = () => {
      const unmountEventing = useNovaUnmountEventing();
      expect(unmountEventing).toBeDefined();

      useEffect(
        () => () => {
          unmountEventing.bubble({} as ReactEventWrapper);
        },
        [unmountEventing],
      );

      return null;
    };

    const { unmount } = render(
      <NovaEventingProvider
        eventing={eventing}
        unmountEventing={unmountEventingMock}
        reactEventMapper={mapper}
      >
        <TestPassedContextComponent />
      </NovaEventingProvider>,
    );

    unmount();

    expect(unmountEventingMock.bubble).toHaveBeenCalled();
    expect(eventing.bubble).not.toHaveBeenCalled();
  });
});
