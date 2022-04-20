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
  event: NovaEvent<unknown>; // The event details for handling
  source: Source; // Details about the underlying event
}

export interface NovaEvent<T> {
  originator: string; // eg AppBar - matches to the Views root element for the control
  type: string; // eg AppTileClick - control will have multiple groups of events
  data?: () => T; // Optional function to generate the data associated with the event
}

/**
 * The Source object contains the information about the user interaction
 * used to generate the Event. For Nova Eventing in React, it is automatically
 * derived from the React SyntheticEvent.
 * Additional metadata will be added here as required by event managers.
 */
export interface Source {
  timeStamp: number; // When the event occured
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
  unknown: "unknown", // Fallback for events triggered by the user from an unknown input
  mouse: "mouse",
  keyboard: "keyboard",
  touch: "touch",
  pen: "pen",
  programmatic: "programmatic", // Used for events triggered by code processes
} as const;
