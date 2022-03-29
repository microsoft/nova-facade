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
