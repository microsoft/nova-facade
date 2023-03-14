/**
 * @jest-environment jsdom
 */

import type { SyntheticEvent } from "react";
import { mapEventMetadata } from "./react-event-source-mapper";
import type { NovaEvent } from "@nova/types";
import { InputType } from "@nova/types";

const nowTimeStamp = 1670638671187;
Date.now = jest.fn(() => nowTimeStamp);

const mappedTypes = [
  ["dblclick", InputType.mouse],
  ["keydown", InputType.keyboard],
  ["keyup", InputType.keyboard],
  ["keypress", InputType.keyboard],
  ["mousedown", InputType.mouse],
  ["mouseenter", InputType.mouse],
  ["mouseleave", InputType.mouse],
  ["mousemove", InputType.mouse],
  ["mouseover", InputType.mouse],
  ["mouseout", InputType.mouse],
  ["mouseup", InputType.mouse],
  ["touchcancel", InputType.touch],
  ["touchend", InputType.touch],
  ["touchmove", InputType.touch],
  ["touchstart", InputType.touch],
  ["wheel", InputType.mouse],
  ["scroll", InputType.unknown],
  ["input", InputType.unknown],
  ["submit", InputType.unknown],
  ["toggle", InputType.unknown],
];

const mappedPointerTypes = [
  ["", InputType.keyboard],
  ["mouse", InputType.mouse],
  ["pen", InputType.pen],
  ["touch", InputType.touch],
  ["newUnknown", InputType.unknown],
];

const novaEventWithData: NovaEvent<string> = {
  data: jest.fn(),
  originator: "testOrigin",
  type: "testType",
};

const timeStamp = 123;
const timeOrigin = 1670638671187;

const mockUIEvent: SyntheticEvent = {
  target: {} as EventTarget,
  timeStamp,
  type: "keydown",
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  nativeEvent: {
    view: {
      performance: {
        timeOrigin,
      },
    },
  } as unknown as UIEvent,
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

describe(mapEventMetadata, () => {
  test.each(mappedTypes)(
    "Validate React events with type `%s` maps to expected Nova input type",
    (eventType: string, novaInputType: string) => {
      mockUIEvent.type = eventType;
      const mappedEventWrapper = mapEventMetadata({
        reactEvent: mockUIEvent,
        event: novaEventWithData,
      });
      // Assert that the inputType maps correctly to the expected Nova inputType
      expect(mappedEventWrapper.source.inputType).toEqual(novaInputType);
      expect(mappedEventWrapper.source.timeStamp).toEqual(
        timeStamp + timeOrigin,
      );
      expect(mappedEventWrapper.event).toEqual(novaEventWithData);
    },
  );

  test.each(mappedPointerTypes)(
    "Validate React Pointer events with type `%s` maps to correct Nova input type",
    (eventType: string, novaInputType: string) => {
      mockUIEvent.type = "click";
      mockUIEvent.nativeEvent = {
        pointerType: eventType,
        view: {
          performance: {
            timeOrigin,
          },
        },
      } as unknown as UIEvent;
      const mappedEventWrapper = mapEventMetadata({
        reactEvent: mockUIEvent,
        event: novaEventWithData,
      });
      // Assert that the inputType maps correctly to the expected Nova inputType
      expect(mappedEventWrapper.source.inputType).toEqual(novaInputType);
      expect(mappedEventWrapper.source.timeStamp).toEqual(
        timeStamp + timeOrigin,
      );
      expect(mappedEventWrapper.event).toEqual(novaEventWithData);
    },
  );

  test("Validate non UI events (no view data) use Date.now for the timestamp", () => {
    const mappedEventWrapper = mapEventMetadata({
      reactEvent: { type: "unknown" } as SyntheticEvent,
      event: novaEventWithData,
    });

    expect(mappedEventWrapper.source.timeStamp).toEqual(nowTimeStamp);
  });

  test("Validate events without a timestamp fallback to Date.now for the timestamp", () => {
    const mappedEventWrapper = mapEventMetadata({
      reactEvent: {
        type: "unknown",
        nativeEvent: {
          view: {
            performance: {
              timeOrigin,
            },
          },
        },
      } as unknown as SyntheticEvent,
      event: novaEventWithData,
    });

    expect(mappedEventWrapper.source.timeStamp).toEqual(nowTimeStamp);
  });
});
