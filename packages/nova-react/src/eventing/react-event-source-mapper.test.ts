/**
 * @jest-environment jsdom
 */

import React from "react";
import { mapEventMetadata } from "./react-event-source-mapper";
import { NovaEvent, InputType } from "@nova/types";

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

describe(mapEventMetadata, () => {
  test.each(mappedTypes)(
    "Validate React events with type `%s` maps to expected Nova input type",
    (eventType: string, novaInputType: string) => {
      mockEvent.type = eventType;
      const mappedEventWrapper = mapEventMetadata({
        reactEvent: mockEvent,
        event: novaEventWithData,
      });
      // Assert that the current theme maps correctly to the Converged theme
      expect(mappedEventWrapper.source.inputType).toEqual(novaInputType);
      expect(mappedEventWrapper.source.timeStamp).toEqual(mockEvent.timeStamp);
      expect(mappedEventWrapper.event).toEqual(novaEventWithData);
    },
  );

  test.each(mappedPointerTypes)(
    "Validate React Pointer events with type `%s` maps to correct Nova input type",
    (eventType: string, novaInputType: string) => {
      mockEvent.type = "click";
      mockEvent.nativeEvent = {
        pointerType: eventType,
      } as unknown as Event;
      const mappedEventWrapper = mapEventMetadata({
        reactEvent: mockEvent,
        event: novaEventWithData,
      });
      // Assert that the current theme maps correctly to the Converged theme
      expect(mappedEventWrapper.source.inputType).toEqual(novaInputType);
      expect(mappedEventWrapper.source.timeStamp).toEqual(mockEvent.timeStamp);
      expect(mappedEventWrapper.event).toEqual(novaEventWithData);
    },
  );
});
