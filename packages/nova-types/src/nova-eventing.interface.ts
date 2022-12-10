/**
 * Describes the eventing contract that is used to communicate between UI components and their logical parent within a host application.
 *
 * Usage: components should create small independent packages that define the events they generate using this contract.
 * Logical parents can take a dependency on the event package, and use it to translate the events into appropriate actions within the larger application.
 */

export interface NovaEventing {
  bubble(event: EventWrapper): Promise<void>;
}

export interface EventWrapper {
  /**
   * The event details for handling
   */
  event: NovaEvent<unknown>;
  /**
   * Details about the originating event like input method and timestamp
   */
  source: Source;
}

export interface NovaEvent<T> {
  /**
   * The Event originator is a unique string identifier the component
   * that is sending the event.
   * e.g. AppBar
   */
  originator: string;
  /**
   * The Event type is a unique string within an originator that specifies the nature
   * of the event. Each originator will likely support multiple types of events.
   * e.g. AppTileClick
   */
  type: string;
  /**
   * The optional Event data function allows the originator to encode typed data
   * with the event. This can be used for functional purposes, or in combination
   * with the Source object for telemetry purposes.
   */
  data?: () => T;
}

/**
 * The Source object contains the information about the user interaction
 * that generated the Event. For Nova Eventing in React, it is automatically
 * derived from the React SyntheticEvent.
 * Additional metadata will be added here as required by event managers.
 */
export interface Source {
  /**
   * Timestamp is a number in Epoch format (milliseconds since 1 Jan 1970).
   * For Nova Eventing in React, if not able to be extracted from the React
   * event, the event source mapper should set it to Date.now() at the point
   * of bubbling.
   */
  timeStamp: number;
  /**
   * InputType is the UI framework agnostic list of detectable input types.
   * This list should be extended as additional input types are created.
   * Note: at this point in time there is no reliable way to detect screen readers.
   * They are detected as either mouse or keyboard depending in the reader's interaction
   * mode.
   */
  inputType: keyof typeof InputType;
}

/**
 * InputType is the UI framework agnostic list of detectable input types.
 * This list should be extended as additional input types are created.
 * Note: at this point in time there is no reliable way to detect screen readers.
 * They are detected as either mouse or keyboard depending in the reader's interaction
 * mode.
 */
export const InputType = {
  /**
   * Fallback for events triggered by the user from an unknown input
   */
  unknown: "unknown",
  mouse: "mouse",
  keyboard: "keyboard",
  touch: "touch",
  pen: "pen",
  /**
   * Used for events triggered by code processes
   */
  programmatic: "programmatic",
} as const;
