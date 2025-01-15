/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import type {
  GeneratedEventWrapper,
  ReactEventWrapper,
  NovaReactEventing,
} from "./nova-eventing-provider";
import { NovaEventingInterceptor } from "./nova-eventing-provider";
import {
  NovaEventingProvider,
  useNovaEventing,
  useNovaUnmountEventing,
} from "./nova-eventing-provider";
import type { EventWrapper, NovaEventing } from "@nova/types";
import { InputType } from "@nova/types";

import * as ReactEventSourceMapper from "./react-event-source-mapper";

const { useEffect } = React;

jest.mock("./react-event-source-mapper");

describe("useNovaEventing", () => {
  let TestComponent: React.FunctionComponent<any>;
  let eventing: NovaEventing;
  let prevWrappedEventing: NovaReactEventing;
  let eventCallback: () => void;
  const renderSpy = jest.fn();
  const initialChildren = "initial children";
  const updatedChildren = "updated children";

  // With React strict mode enabled, in development mode, the component will render twice, check https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development
  // for more details. This will cause the renderSpy to be called twice on each render, but in prod mode this will only be called once.
  // We add this wrapper to encapsulate the logic for artificially increasing the render count to account for strict mode.
  const expectComponentToRenderTimes = (count: number) => {
    expect(renderSpy).toHaveBeenCalledTimes(count * 2);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const mapEventMetadataSpy = jest.spyOn(
      ReactEventSourceMapper,
      "mapEventMetadata",
    );

    eventing = { bubble: jest.fn() };
    prevWrappedEventing = undefined as unknown as NovaReactEventing;

    TestComponent = ({ childrenText }) => {
      renderSpy();
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
      useNovaEventing();
      return null;
    };

    expect(() => render(<TestUndefinedContextComponent />)).toThrow(
      "Nova Eventing provider must be initialized prior to consumption of eventing!",
    );
  });

  it("useNovaUnmountEventing throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      useNovaUnmountEventing();
      return null;
    };

    expect(() => render(<TestUndefinedContextComponent />)).toThrow(
      "Nova Eventing provider must be initialized prior to consumption of unmountEventing!",
    );
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

    expectComponentToRenderTimes(1);

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
    expectComponentToRenderTimes(2);
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
    expectComponentToRenderTimes(1);

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
    expectComponentToRenderTimes(1);

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
    expectComponentToRenderTimes(1);

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
    expectComponentToRenderTimes(1);

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
    const didGenerate = React.useRef(false);
    React.useEffect(() => {
      if (didGenerate.current) {
        return;
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
      didGenerate.current = true;
    }, []);

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

describe("NovaEventingInterceptor", () => {
  const originalError = console.error;
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = originalError;
  });
  const realMapper = jest.requireActual(
    "./react-event-source-mapper",
  ).mapEventMetadata;

  const mapEventMetadataMock = jest.fn().mockImplementation(realMapper);

  const bubbleMock = jest.fn();

  const parentEventing = {
    bubble: bubbleMock,
    generateEvent: bubbleMock,
  } as unknown as NovaEventing;

  const callbackToBeCalledOnIntercept = jest.fn();

  const defaultInterceptor = (eventWrapper: EventWrapper) => {
    if (eventWrapper.event.originator === "toBeIntercepted") {
      callbackToBeCalledOnIntercept();
      return Promise.resolve(undefined);
    } else {
      return Promise.resolve(eventWrapper);
    }
  };

  const ComponentWithTwoEvents = ({ name }: { name: string }) => {
    const eventing = useNovaEventing();
    const onInterceptClick = (event: React.SyntheticEvent) => {
      eventing.bubble({
        reactEvent: event,
        event: { originator: "toBeIntercepted", type: "TypeToBeIntercepted" },
      });
    };

    const onNonInterceptClick = (event: React.SyntheticEvent) => {
      eventing.bubble({
        reactEvent: event,
        event: {
          originator: "notToBeIntercepted",
          type: "TypeNotToBeIntercepted",
        },
      });
    };
    return (
      <>
        Component with two events
        <button onClick={onInterceptClick}>
          {name}: Fire event to be intercepted
        </button>
        <button onClick={onNonInterceptClick}>
          {name}: Fire event without intercept
        </button>
      </>
    );
  };

  const InterceptorTestComponent: React.FC<{
    interceptor?: (event: EventWrapper) => Promise<EventWrapper | undefined>;
  }> = ({ interceptor = defaultInterceptor }) => (
    <NovaEventingProvider
      eventing={parentEventing}
      reactEventMapper={mapEventMetadataMock}
    >
      <ComponentWithTwoEvents name="outside" />
      <NovaEventingInterceptor interceptor={interceptor}>
        <ComponentWithTwoEvents name="inside" />
      </NovaEventingInterceptor>
    </NovaEventingProvider>
  );

  it("intercepts the event and does not bubble it up", async () => {
    const { getByText } = render(<InterceptorTestComponent />);
    const button = getByText("inside: Fire event to be intercepted");
    button.click();
    expect(callbackToBeCalledOnIntercept).toHaveBeenCalled();
    await waitFor(() => expect(mapEventMetadataMock).toHaveBeenCalled());
    expect(bubbleMock).not.toHaveBeenCalled();
  });

  it("bubbles the event when interceptor returns the event", async () => {
    const { getByText } = render(<InterceptorTestComponent />);
    const button = getByText("inside: Fire event without intercept");
    button.click();
    expect(callbackToBeCalledOnIntercept).not.toHaveBeenCalled();
    await waitFor(() => expect(bubbleMock).toHaveBeenCalled());
  });

  it("doesn't catch events outside of interceptor context", async () => {
    const { getByText } = render(<InterceptorTestComponent />);
    const button = getByText("outside: Fire event to be intercepted");
    button.click();
    expect(callbackToBeCalledOnIntercept).not.toHaveBeenCalled();
    await waitFor(() => expect(bubbleMock).toHaveBeenCalled());
  });

  it("throws an error when rendered outside of NovaEventingProvider", () => {
    console.error = jest.fn();
    expect.assertions(1);
    const InterceptorTestComponent: React.FC = () => (
      <NovaEventingInterceptor interceptor={defaultInterceptor}>
        <ComponentWithTwoEvents name="inside" />
      </NovaEventingInterceptor>
    );

    expect(() => render(<InterceptorTestComponent />)).toThrow(
      "Nova Eventing provider must be initialized prior to creating NovaEventingInterceptor!",
    );
  });

  it("intercepts the event and bubbles up the event when interceptor returns the event anyway", async () => {
    const interceptor = (eventWrapper: EventWrapper) => {
      if (eventWrapper.event.originator === "toBeIntercepted") {
        callbackToBeCalledOnIntercept();
        return Promise.resolve({
          ...eventWrapper,
          event: { ...eventWrapper.event, data: () => "addedData" },
        });
      } else {
        return Promise.resolve(eventWrapper);
      }
    };
    const { getByText } = render(
      <InterceptorTestComponent interceptor={interceptor} />,
    );
    const button = getByText("inside: Fire event to be intercepted");
    button.click();
    expect(callbackToBeCalledOnIntercept).toHaveBeenCalled();
    await waitFor(() => expect(bubbleMock).toHaveBeenCalled());
    const bubbleCall = bubbleMock.mock.calls[0][0];
    expect(bubbleCall.event.data()).toBe("addedData");
  });
});

describe("Multiple NovaEventingInterceptors", () => {
  const originalError = console.error;
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = originalError;
  });
  const realMapper = jest.requireActual(
    "./react-event-source-mapper",
  ).mapEventMetadata;

  const mapEventMetadataMock = jest.fn().mockImplementation(realMapper);

  const bubbleMock = jest.fn();

  const parentEventing = {
    bubble: bubbleMock,
    generateEvent: bubbleMock,
  } as unknown as NovaEventing;

  const callbackToBeCalledOnFirstIntercept = jest.fn();
  const callbackToBeCalledOnSecondIntercept = jest.fn();

  const evenOriginatorToBeInterceptedFirst = "toBeInterceptedFirst";
  const evenOriginatorToBeInterceptedSecond = "toBeInterceptedSecond";

  const firstInterceptor = (eventWrapper: EventWrapper) => {
    if (eventWrapper.event.originator === evenOriginatorToBeInterceptedFirst) {
      callbackToBeCalledOnFirstIntercept();
      return Promise.resolve(undefined);
    } else {
      return Promise.resolve(eventWrapper);
    }
  };

  const secondInterceptor = (eventWrapper: EventWrapper) => {
    if (eventWrapper.event.originator === evenOriginatorToBeInterceptedSecond) {
      callbackToBeCalledOnSecondIntercept();
      return Promise.resolve(undefined);
    } else {
      return Promise.resolve(eventWrapper);
    }
  };

  const ComponentWithTwoEvents = ({
    name,
    eventOriginatorToBeIntercepted,
  }: {
    name: string;
    eventOriginatorToBeIntercepted: string;
  }) => {
    const eventing = useNovaEventing();
    const onInterceptClick = (event: React.SyntheticEvent) => {
      eventing.bubble({
        reactEvent: event,
        event: {
          originator: eventOriginatorToBeIntercepted,
          type: "TypeToBeIntercepted",
        },
      });
    };

    const onNonInterceptClick = (event: React.SyntheticEvent) => {
      eventing.bubble({
        reactEvent: event,
        event: {
          originator: "notToBeIntercepted",
          type: "TypeNotToBeIntercepted",
        },
      });
    };
    return (
      <>
        Component with two events
        <button onClick={onInterceptClick}>
          {name}: Fire event to be intercepted
        </button>
        <button onClick={onNonInterceptClick}>
          {name}: Fire event without intercept
        </button>
      </>
    );
  };

  const MultipleInterceptorsTestComponent: React.FC = () => (
    <NovaEventingProvider
      eventing={parentEventing}
      reactEventMapper={mapEventMetadataMock}
    >
      <NovaEventingInterceptor interceptor={firstInterceptor}>
        <NovaEventingInterceptor interceptor={secondInterceptor}>
          <ComponentWithTwoEvents
            name="toBeInterceptedInFirstInterceptor"
            eventOriginatorToBeIntercepted={evenOriginatorToBeInterceptedFirst}
          />
          <ComponentWithTwoEvents
            name="toBeInterceptedInSecondInterceptor"
            eventOriginatorToBeIntercepted={evenOriginatorToBeInterceptedSecond}
          />
        </NovaEventingInterceptor>
      </NovaEventingInterceptor>
    </NovaEventingProvider>
  );

  it("intercepts the event in second interceptor and does not bubble it up", async () => {
    const { getByText } = render(<MultipleInterceptorsTestComponent />);
    const button = getByText(
      "toBeInterceptedInSecondInterceptor: Fire event to be intercepted",
    );
    button.click();

    await waitFor(() => expect(mapEventMetadataMock).toHaveBeenCalled());
    expect(callbackToBeCalledOnSecondIntercept).toHaveBeenCalled();
    expect(bubbleMock).not.toHaveBeenCalled();
    expect(callbackToBeCalledOnFirstIntercept).not.toHaveBeenCalled();
  });

  it("bubbles the event when interceptor returns the event", async () => {
    const { getByText } = render(<MultipleInterceptorsTestComponent />);
    const button = getByText(
      "toBeInterceptedInFirstInterceptor: Fire event without intercept",
    );
    button.click();

    await waitFor(() => expect(bubbleMock).toHaveBeenCalled());
    expect(callbackToBeCalledOnSecondIntercept).not.toHaveBeenCalled();
    expect(callbackToBeCalledOnFirstIntercept).not.toHaveBeenCalled();
  });

  it("intercepts the event in first interceptor and does not bubble it up", async () => {
    const { getByText } = render(<MultipleInterceptorsTestComponent />);
    const button = getByText(
      "toBeInterceptedInFirstInterceptor: Fire event to be intercepted",
    );
    button.click();

    await waitFor(() => expect(bubbleMock).not.toHaveBeenCalled());
    await waitFor(() => expect(mapEventMetadataMock).toHaveBeenCalled());
    expect(callbackToBeCalledOnSecondIntercept).not.toHaveBeenCalled();
    expect(callbackToBeCalledOnFirstIntercept).toHaveBeenCalled();
  });
});
