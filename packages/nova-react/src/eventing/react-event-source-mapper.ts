import { EventWrapper, InputType, Source } from "@nova/types";
import { ReactEventWrapper } from "./nova-eventing-provider";

/**
 * Maps DOM event type strings to the Nova InputType.
 *
 * Initial implementation is not exhaustive and should be
 * extended as new requirements arise.
 *
 * Note following excluded event types that could be considered:
 * scroll, input, submit, toggle
 */
const typeMap = {
  dblclick: InputType.mouse,
  keydown: InputType.keyboard,
  keyup: InputType.keyboard,
  keypress: InputType.keyboard,
  mousedown: InputType.mouse,
  mouseenter: InputType.mouse,
  mouseleave: InputType.mouse,
  mousemove: InputType.mouse,
  mouseover: InputType.mouse,
  mouseout: InputType.mouse,
  mouseup: InputType.mouse,
  touchcancel: InputType.touch,
  touchend: InputType.touch,
  touchmove: InputType.touch,
  touchstart: InputType.touch,
  wheel: InputType.mouse,
};

/**
 * Maps PointerEvent pointerTypes to Nova InputType.
 *
 * Initial implementation assumes all "" pointer types
 * come from keyboard triggered events using enter/space.
 *
 * If other input sources are discovered to also trigger
 * PointerEvents with "" type, this will need to be revised.
 */
const pointerTypeMap = {
  "": InputType.keyboard,
  mouse: InputType.mouse,
  pen: InputType.pen,
  touch: InputType.touch,
};

/**
 * Uses the pointer type map to decide the Nova input type.
 * Returns unknown if the map doesn't match.
 * @param pointerType type string from DOM pointer event
 * @returns Nova input type
 */
const mapPointerTypeEvents = (pointerType: string): keyof typeof InputType => {
  const inputType = pointerTypeMap[pointerType as keyof typeof pointerTypeMap];
  return inputType ?? InputType.unknown;
};

/**
 * Extracts the React specific event information and maps it into
 * the framework agnostic Nova event format.
 * @param eventWrapper The input event for mapping
 * @returns The mapped event
 */
export const mapEventMetadata = (eventWrapper: ReactEventWrapper<unknown>) => {
  const { event, reactEvent } = eventWrapper;
  const inputType =
    reactEvent.type === "click"
      ? mapPointerTypeEvents(
          (reactEvent as React.PointerEvent).nativeEvent.pointerType,
        )
      : typeMap[reactEvent.type as keyof typeof typeMap];

  const source: Source = {
    inputType: inputType ?? InputType.unknown,
    timeStamp: reactEvent.timeStamp,
  };

  const mappedEvent: EventWrapper<unknown> = {
    event,
    source,
  };

  return mappedEvent;
};
